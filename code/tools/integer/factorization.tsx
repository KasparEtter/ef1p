/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactElement, ReactNode } from 'react';

import { estimateStringWidth } from '../../utility/string-width';

import { ClickToCopy } from '../../react/copy';
import { DynamicBooleanEntry, DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { join } from '../../react/utility';
import { VersionedStore } from '../../react/versioned-store';

import { f, Factor, phi, sortAndCombineFactors } from '../../math/factorization';
import { encodeInteger, Exponent, Integer, MinusSign, ModuloSign, MultiplicationSign } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat, IntegerFormat } from '../../math/integer';
import { isProbablePrime } from '../../math/prime';
import { abs, greatestCommonDivisor, halve, isEven, leastCommonMultiple, one, sqrt, two, zero } from '../../math/utility';

import { createMeteredAnimation, delay, initialIntegerMeteredAnimationOutputState, IntegerMeteredAnimationOutputState, minDelay, SetOutput } from '../utility/animation';
import { renderFactor } from '../utility/factors';
import { integerGreaterOne } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

const integer: DynamicTextEntry<State> = {
    ...integerGreaterOne,
    defaultValue: '231',
    inputWidth: 245,
};

const totients: DynamicBooleanEntry<State> = {
    label: 'Totients',
    tooltip: "Whether to calculate Euler's and Carmichael's totient functions as well.",
    defaultValue: false,
    inputType: 'switch',
};

interface State {
    integer: string;
    totients: boolean;
    delay: number;
}

const entries: DynamicEntries<State> = {
    integer,
    totients,
    delay,
};

const store = new VersionedStore(entries, 'integer-factorization');
const Input = getInput(store);

/* ------------------------------ Tools ------------------------------ */

interface SharedOutputState extends IntegerMeteredAnimationOutputState {
    integer?: bigint;
    factors: Factor[];
    totients: boolean;
}

const initialSharedOutputState: SharedOutputState = {
    ...initialIntegerMeteredAnimationOutputState,
    factors: [],
    totients: false,
}

function renderFactorForEulersTotient(factor: Factor, format: IntegerFormat): ReactNode {
    return <Fragment>
        {(factor.exponent > one) && <Fragment>
            <Integer integer={factor.base} format={format}/>
            <Exponent exponent={<Fragment><Integer integer={factor.exponent} format={format}/><MinusSign/>1</Fragment>} parenthesesIfNotRaised/>
            <MultiplicationSign/>
        </Fragment>}
        (<Integer integer={factor.base} format={format}/><MinusSign/>1)
    </Fragment>;
}

function renderFactorForCarmichaelsTotient(factor: Factor, format: IntegerFormat): ReactNode {
    return <Fragment>
        {factor.exponent > one ? <Fragment>
            <Integer integer={factor.base} format={format}/>
            <Exponent exponent={<Fragment><Integer integer={factor.exponent} format={format}/><MinusSign/>{factor.base === two && factor.exponent > two ? '2' : '1'}</Fragment>} parenthesesIfNotRaised/>
            <MultiplicationSign/>
            (<Integer integer={factor.base} format={format}/><MinusSign/>1)
        </Fragment> : <Fragment>
            <Integer integer={factor.base} format={format}/><MinusSign/>1
        </Fragment>}
    </Fragment>;
}

function renderFactorizationTable(state: Readonly<SharedOutputState>): ReactNode {
    const array: ReactNode[] = [];
    let euler = <Fragment></Fragment>;
    let carmichael = <Fragment></Fragment>;
    if (!state.finished || state.error !== undefined) {
        array.push('…');
    } else if (state.totients) {
        euler = <Fragment> = <ClickToCopy><b><Integer integer={phi(state.factors)} format={state.format}/></b></ClickToCopy></Fragment>;
        const integers = state.factors.map(factor => (factor.base ** (factor.exponent - (factor.base === two && factor.exponent > two ? two : one))) * (factor.base - one));
        const lambda = integers.reduce((previous, current) => leastCommonMultiple(previous, current), one);
        carmichael = <Fragment><br/>
            = lcm({join(integers.map(integer => <Integer integer={integer} format={state.format}/>))}){' '}
            = <ClickToCopy><b><Integer integer={lambda} format={state.format}/></b></ClickToCopy>
        </Fragment>;
    }
    return <table className="list">
        <tr>
            <th><Integer integer={state.integer!} format={state.format}/></th>
            <td>= <ClickToCopy>{join(state.factors.map(factor => renderFactor(factor, state.format)).concat(array), <MultiplicationSign/>)}</ClickToCopy></td>
        </tr>
        {state.totients && <Fragment>
            <tr>
                <th>φ(<Integer integer={state.integer!} format={state.format}/>)</th>
                <td>= {join(state.factors.map(factor => renderFactorForEulersTotient(factor, state.format)).concat(array), <MultiplicationSign/>)}{euler}</td>
            </tr>
            <tr>
                <th>λ(<Integer integer={state.integer!} format={state.format}/>)</th>
                <td>= lcm({join(state.factors.map(factor => renderFactorForCarmichaelsTotient(factor, state.format)).concat(array))}){carmichael}</td>
            </tr>
        </Fragment>}
    </table>;
}

export const [toolIntegerFactorizationTrialDivision, toolIntegerFactorizationPollardsRho] = [(() => {

        /* ------------------------------ Trial division ------------------------------ */

        interface OutputState extends SharedOutputState {
            leftover?: bigint | undefined;
            base?: bigint | undefined;
            remainder?: bigint | undefined;
            exponent?: bigint | undefined;
        }

        function render(state: Readonly<OutputState>): ReactElement {
            return <Fragment>
                {renderFactorizationTable(state)}
                {state.base !== undefined && <p className="text-center">
                    <Integer integer={state.leftover!} format={state.format}/><ModuloSign/><Integer integer={state.base!} format={state.format} color="blue"/> {' '}
                    = <span className="d-inline-block text-left" style={{ minWidth: estimateStringWidth(encodeInteger(state.base!)) + 10 }}><Integer integer={state.remainder!} format={state.format} color={state.remainder === zero ? 'green' : 'red'}/></span> {' '}
                    (Exponent: <Integer integer={state.exponent!} format={state.format}/>)
                </p>}
            </Fragment>;
        }

        const updateFrequency = BigInt(2_500_000);

        async function run(state: Readonly<State>, setOutput: SetOutput<OutputState>): Promise<void> {
            let leftover = decodeInteger(state.integer);
            const factors: Factor[] = [];
            const format = determineIntegerFormat(state.integer);
            await setOutput(minDelay, { integer: leftover, factors, totients: state.totients, leftover, format });
            const delay = state.delay * 1000;
            let base = two;
            let steps = zero;
            while (base * base <= leftover) {
                let exponent = zero;
                let remainder = zero;
                while (remainder === zero) {
                    steps++;
                    remainder = leftover % base;
                    if (delay > 0 || steps % updateFrequency === zero) {
                        await setOutput(delay || minDelay, { steps, leftover, base, remainder, exponent });
                    }
                    if (remainder === zero) {
                        leftover /= base;
                        exponent++;
                    }
                }
                if (exponent > zero) {
                    factors.push({ base, exponent });
                    if (leftover !== one) {
                        await setOutput(delay || minDelay, { steps, factors, leftover, base, remainder, exponent });
                    }
                }
                if (base === two) {
                    base += one;
                } else {
                    base += two;
                }
            }
            if (leftover !== one) {
                factors.push({ base: leftover, exponent: one });
            }
            await setOutput(0, { steps, factors, leftover: undefined, base: undefined });
        }

        const [factorize, Output] = createMeteredAnimation(
            initialSharedOutputState,
            state => state.integer !== undefined,
            render,
            run,
        );

        return [
            <Fragment>
                <Input submit={{
                    label: 'Factorize',
                    tooltip: 'Search for factors of the given integer with trial division.',
                    onClick: factorize,
                }}/>
                <Output/>
            </Fragment>,
            store,
            factorize,
        ] as Tool;

    })(),
    (() => {

        /* ------------------------------ Pollard's rho ------------------------------ */

        interface Evaluation {
            a: bigint;
            b: bigint;
            gcd: bigint;
            steps: bigint;
            sqrt?: bigint;
            addend: bigint;
        }

        interface Result {
            n: bigint;
            evaluation?: Evaluation | undefined; // If undefined, n is prime.
        }

        interface OutputState extends SharedOutputState {
            results: Result[];
        }

        function render(state: Readonly<OutputState>): ReactElement {
            return <Fragment>
                {renderFactorizationTable(state)}
                {state.results.length > 0 && <table>
                    <thead>
                        <tr>
                            <th className="text-right">Input</th>
                            <th>Greatest common divisor</th>
                            <th className="text-right">Steps</th>
                            <th className="text-right cursor-help" title="The square root of the found factor.">Sqrt</th>
                            <th className="text-right cursor-help" title="The offset in the sequence function.">+</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.results.map(result => <tr>
                            <td className="text-right"><Integer integer={result.n} format={state.format}/></td>
                            {result.evaluation === undefined ? <Fragment>
                                <td>is prime</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </Fragment> : <Fragment>
                                <td>
                                    gcd(<Integer integer={result.n} format={state.format}/>, |<Integer integer={result.evaluation.a} format={state.format}/><MinusSign/><Integer integer={result.evaluation.b} format={state.format}/>|) {' '}
                                    = <Integer integer={result.evaluation.gcd} format={state.format} color={result.evaluation.gcd === one ? 'orange' : result.evaluation.gcd === state.integer ? 'red' : 'green'}/>
                                </td>
                                <td className="text-right">{<Integer integer={result.evaluation.steps} format={state.format}/>}</td>
                                <td className="text-right">{result.evaluation.sqrt !== undefined && <Integer integer={result.evaluation.sqrt} format={state.format}/>}</td>
                                <td className="text-right">{<Integer integer={result.evaluation.addend} format={state.format}/>}</td>
                            </Fragment>}
                        </tr>)}
                    </tbody>
                </table>}
            </Fragment>;
        }

        const updateFrequency = BigInt(100_000);

        async function run(state: Readonly<State>, setOutput: SetOutput<OutputState>): Promise<void> {
            const integer = decodeInteger(state.integer);
            const format = determineIntegerFormat(state.integer);
            await setOutput(minDelay, { integer, factors: [], totients: state.totients, format });
            const factors: bigint[] = [];
            const results: Result[] = [];
            const delay = state.delay * 1000;
            let n = integer;
            while (isEven(n)) {
                n = halve(n);
                factors.push(two);
            }
            if (n === one) {
                await setOutput(0, { factors: sortAndCombineFactors(factors), results });
                return;
            }
            const queue = [n];
            let steps = zero;
            outer: while (queue.length > 0) {
                const n = queue.pop()!;
                if (isProbablePrime(n, 64)) {
                    factors.push(n);
                    results.push({ n });
                    await setOutput(delay || minDelay, { steps, factors: sortAndCombineFactors(factors), results });
                } else {
                    const evaluation: Evaluation = {
                        a: two,
                        b: two,
                        gcd: one,
                        steps: zero,
                        addend: one,
                    };
                    results.push({ n, evaluation });
                    for (let addend = one; addend < n; addend++) {
                        evaluation.a = two;
                        evaluation.b = two;
                        evaluation.gcd = one;
                        evaluation.addend = addend;
                        while (evaluation.gcd === one) {
                            steps++;
                            evaluation.steps++;
                            evaluation.a = f(evaluation.a, n, addend);
                            evaluation.b = f(f(evaluation.b, n, addend), n, addend);
                            evaluation.gcd = greatestCommonDivisor(n, abs(evaluation.a - evaluation.b));
                            if (delay > 0 || evaluation.steps % updateFrequency === zero) {
                                await setOutput(delay || minDelay, { steps, results });
                            }
                        }
                        if (evaluation.gcd !== n) {
                            evaluation.sqrt = sqrt(evaluation.gcd);
                            queue.push(n / evaluation.gcd, evaluation.gcd);
                            if (delay === 0) {
                                await setOutput(minDelay, { steps, results });
                            }
                            continue outer;
                        }
                    }
                    await setOutput(0, { steps, results, error: `Failed to factor ${encodeInteger(n)}.` });
                    return;
                }
            }
        }

        const [factorize, Output] = createMeteredAnimation(
            {
                ...initialSharedOutputState,
                results: [],
            },
            state => state.integer !== undefined,
            render,
            run,
        );

        return [
            <Fragment>
                <Input submit={{
                    label: 'Factorize',
                    tooltip: 'Search for factors of the given integer with trial division.',
                    onClick: factorize,
                }}/>
                <Output/>
            </Fragment>,
            store,
            factorize,
        ] as Tool;

    })(),
];
