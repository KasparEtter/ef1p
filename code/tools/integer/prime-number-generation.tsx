/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactElement } from 'react';

import { estimateStringWidth } from '../../utility/string-width';

import { ClickToCopy } from '../../react/copy';
import { DynamicBooleanEntry, DynamicEntries, DynamicNumberEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { encodeInteger, Exponent, Integer } from '../../math/formatting';
import { MultiplicativeGroup } from '../../math/multiplicative-group';
import { isProbablePrime } from '../../math/prime';
import { double, getRandomInteger, isEven, one, two, zero } from '../../math/utility';

import { createMeteredAnimation, delay, initialMeteredAnimationOutputState, MeteredAnimationOutputState, minDelay, SetOutput } from '../utility/animation';

/* ------------------------------ Input ------------------------------ */

const bits: DynamicNumberEntry<State> = {
    label: 'Bits',
    tooltip: 'The number of bits of the prime number to be generated.',
    defaultValue: 32,
    inputType: 'number',
    inputWidth: 60,
    minValue: 8,
    maxValue: 2048,
};

const safe: DynamicBooleanEntry<State> = {
    label: 'Safe prime',
    tooltip: 'Whether to generate a safe prime.',
    defaultValue: false,
    inputType: 'switch',
};

const generator: DynamicBooleanEntry<State> = {
    label: 'Generator',
    tooltip: 'Whether to find a generator for the multiplicative group.',
    defaultValue: false,
    inputType: 'switch',
    disable: inputs => !inputs.safe,
};

interface State {
    bits: number;
    safe: boolean;
    generator: boolean;
    delay: number;
}

const entries: DynamicEntries<State> = {
    bits,
    safe,
    generator,
    delay,
};

const store = new VersionedStore(entries, 'integer-prime-number-generation');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

interface OutputState extends MeteredAnimationOutputState {
    p: bigint;
    pPrime: boolean;
    safe: boolean;
    q: bigint;
    qPrime: boolean;
    pPrimeCounter: number;
    generators: bigint[];
    minWidth: number;
}

function render(state: Readonly<OutputState>): ReactElement {
    return <Fragment>
        <table className="list text-right">
            <tr><th>Attempts:</th><td><Integer integer={state.steps}/></td></tr>
            {state.safe && <tr><th>p was prime:</th><td><Integer integer={state.pPrimeCounter}/></td></tr>}
            <tr><th>Elapsed time:</th><td>{((performance.now() - state.startTime) / 1000).toFixed(2)} s</td></tr>
        </table>
        <table className="list text-right text-break">
            <tr><th>p =</th><td style={{ minWidth: state.minWidth }}><ClickToCopy><Integer integer={state.p} color={state.pPrime ? 'green' : 'red'}/></ClickToCopy></td></tr>
            {state.safe && <tr><th>q = 2p + 1 =</th><td>{state.q !== zero && <ClickToCopy><Integer integer={state.q} color={state.qPrime ? 'green' : 'red'}/></ClickToCopy>}</td></tr>}
        </table>
        {state.generators.length > 0 && <table className="text-right text-break">
            <thead>
                <tr>
                    <th className="text-left text-nowrap">Potential generator G</th>
                    <th className="text-nowrap">G<Exponent exponent="p"/></th>
                </tr>
            </thead>
            <tbody>
                {state.generators.map((generator, index) => <tr>
                    <td><ClickToCopy><Integer integer={generator} color={index === state.generators.length - 1 ? 'green' : 'red'}/></ClickToCopy></td>
                    <td>{index === state.generators.length - 1 ? '-1' : '1'}</td>
                </tr>)}
            </tbody>
        </table>}
    </Fragment>;
}

// Rough interpolation from note 4.49 in https://cacr.uwaterloo.ca/hac/about/chap4.pdf for 128 bits.
// (For 64 bits and less, the fixed bases guarantee that p and q are prime.)
const rounds = 25;

const updateFrequency = BigInt(2_500);

async function run(state: Readonly<State>, setOutput: SetOutput<OutputState>): Promise<void> {
    await setOutput(minDelay, { safe: state.safe });
    const bits = BigInt(state.bits - (state.safe ? 1 : 0));
    const lower = two ** (bits - one);
    const upper = (two ** bits) - one;
    const delay = state.delay * 1000;
    if (delay > 0) {
        await setOutput(0, { minWidth: Math.ceil(estimateStringWidth(encodeInteger(upper * (state.safe ? two : one)))) + 12 });
    }
    let steps = zero;
    let pPrimeCounter = 0;
    while (true) {
        steps++;
        let p = getRandomInteger(lower, upper);
        if (isEven(p)) {
            p += one;
        }
        const pPrime = isProbablePrime(p, rounds);
        if (pPrime && state.safe) {
            pPrimeCounter++;
            const q = double(p) + one;
            const qPrime = isProbablePrime(q, rounds);
            if (delay > 0 || qPrime) {
                await setOutput(0, { p, pPrime, q, qPrime, steps, pPrimeCounter });
            }
            if (qPrime) {
                if (state.generator) {
                    const group = MultiplicativeGroup.fromPrime(q);
                    const generators = new Array<bigint>();
                    const qMinus2 = q - two;
                    let generator;
                    do {
                        generator = getRandomInteger(two, qMinus2);
                        generators.push(generator);
                    } while (group.getElement(generator).repeat(p).isIdentity());
                    await setOutput(0, { generators });
                }
                return;
            }
        } else {
            if (delay > 0 || pPrime) {
                await setOutput(0, { p, pPrime, q: zero, steps });
            }
            if (pPrime) {
                return;
            }
        }
        if (delay > 0) {
            await setOutput(delay)
        } else if (steps % updateFrequency === zero) {
            await setOutput(minDelay, { steps, pPrimeCounter });
        }
    }
}

const [generate, Output] = createMeteredAnimation(
    {
        ...initialMeteredAnimationOutputState,
        p: zero,
        pPrime: false,
        safe: false,
        q: zero,
        qPrime: false,
        pPrimeCounter: 0,
        generators: [],
        minWidth: 0,
    },
    state => state.steps !== zero,
    render,
    run,
    false,
);

/* ------------------------------ Tool ------------------------------ */

export const toolIntegerPrimeNumberGeneration: Tool = [
    <Fragment>
        <Input
            submit={{
                label: 'Generate',
                tooltip: 'Generate a random (safe) prime number with the given number of bits.',
                onClick: generate,
            }}
        />
        <Output/>
    </Fragment>,
    store,
    generate,
];
