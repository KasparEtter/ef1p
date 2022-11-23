/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { regex } from '../../utility/string';

import { DetermineButton, DynamicBooleanEntry, DynamicEntries, DynamicNumberEntry, DynamicRangeEntry, DynamicTextEntry, InputError } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { Text } from '../../react/text';
import { VersionedStore } from '../../react/versioned-store';

import { AdditionSign, encodeInteger, Exponent, Integer, MinusSign, ModuloSign, MultiplicationSign } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat, nonNegativeIntegerString, nonNegativeIntegerWithoutComma } from '../../math/integer';
import { MultiplicativeRing, MultiplicativeRingElement } from '../../math/multiplicative-ring';
import { five, getPseudoRandomInteger, halve, isEven, max, minusOne, mulberry32, one, two, zero } from '../../math/utility';

import { integerInputWidth, nonNegativeInteger } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

const input: DynamicTextEntry<State> = {
    ...nonNegativeInteger,
    label: 'Input n',
    defaultValue: '12345678910987654321',
    inputWidth: integerInputWidth,
    stayEnabled: true,
    validateDependently: input => {
        const integer = decodeInteger(input);
        return integer < five && 'The integer has to be at least 5.' || isEven(integer) && 'The integer has to be odd.';
    },
    onUpOrDown: (event, input) => {
        const integer = decodeInteger(input);
        return encodeInteger(max(integer + (isEven(integer) ? one : two) * (event === 'up' ? one : minusOne), five), determineIntegerFormat(input));
    },
};

const integerListRegex = regex(`(${nonNegativeIntegerWithoutComma}(,${nonNegativeIntegerWithoutComma})*|${nonNegativeIntegerString}(;${nonNegativeIntegerString})+)`);

function decodeIntegerList(input: string): bigint[] {
    if (input === undefined) {
        input = candidates.defaultValue;
    }
    if (input.trim() === '') {
        return [];
    } else {
        return input.split(input.includes(';') ? ';' : ',').map(part => decodeInteger(part));
    }
}

function validateCandidates(input: string, inputs: Readonly<State>): InputError {
    const integer = decodeInteger(inputs.input);
    return decodeIntegerList(input).some(witness => witness <= zero || witness >= integer) && 'Each candidate has to be strictly between 0 and n.';
}

const candidates: DynamicTextEntry<State> = {
    label: 'Candidates',
    tooltip: 'A comma-separated list of candidates strictly between 0 and n.',
    defaultValue: '2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37',
    inputType: 'text',
    inputWidth: integerInputWidth,
    dependencies: 'input',
    validateIndependently: input => !integerListRegex.test(input) && 'This is not comma-separated list of positive integers.',
    validateDependently: validateCandidates,
};

const maxValue = 4294967295;

const incrementSeed: DetermineButton<number> = {
    label: 'Increment',
    tooltip: 'Increments the seed by one.',
    onClick: async input => input + 1,
    disable: input => input >= 4294967295,
}

export const seed: DynamicNumberEntry<State> = {
    label: 'Seed',
    tooltip: 'The 32-bit integer from which the pseudo-random candidates are derived.',
    defaultValue: 0,
    minValue: 0,
    maxValue,
    inputType: 'number',
    inputWidth: integerInputWidth - 85,
    determine: incrementSeed,
};

export const rounds: DynamicRangeEntry<State> = {
    label: 'Rounds',
    tooltip: 'Configure how many pseudo-random candidates shall be tested after testing the provided candidates.',
    defaultValue: 0,
    inputType: 'range',
    inputWidth: 100,
    minValue: inputs => inputs.candidates.trim() === '' ? 1 : 0,
    dependencies: 'candidates',
};

export const abort: DynamicBooleanEntry<State> = {
    label: 'Abort',
    tooltip: 'Whether to abort testing when the input n has been shown to be composite.',
    defaultValue: true,
    inputType: 'switch',
};

interface State {
    input: string;
    candidates: string;
    seed: number;
    rounds: number;
    abort: boolean;
}

const entries: DynamicEntries<State> = {
    input,
    candidates,
    seed,
    rounds,
    abort,
};

const store = new VersionedStore(entries, 'integer-primality-test');
const Input = getInput(store);

function renderRatio(liars: number, witnesses: number): JSX.Element {
    return <table className="list text-right">
        <tr><th>Number of found liars:</th><td>{liars}</td></tr>
        <tr><th>Number of found witnesses:</th><td>{witnesses}</td></tr>
        <tr><th>Ratio of found liars to tested candidates:</th><td>{(liars / (liars + witnesses)).toFixed(2)}</td></tr>
    </table>;
}

/* ------------------------------ Fermat primality test ------------------------------ */

function RawFermatPrimalityTest(state: Readonly<State>): JSX.Element {
    const format = determineIntegerFormat(state.input);
    const n = decodeInteger(state.input);
    const ring = new MultiplicativeRing(n);
    const nMinus1 = n - one;
    const results = new Array<[MultiplicativeRingElement, MultiplicativeRingElement]>();
    let isProbablyPrime = true;

    function isWitness(a: bigint): boolean {
        const element = ring.getElement(a);
        const result = element.exponentiate(nMinus1);
        results.push([element, result]);
        if (!result.isOne()) {
            isProbablyPrime = false;
            return true;
        } else {
            return false;
        }
    }

    let liars = 0;
    let witnesses = 0;

    const candidates = decodeIntegerList(state.candidates);
    for (const candidate of candidates) {
        if (isWitness(candidate)) {
            if (state.abort) {
                break;
            } else {
                witnesses++;
            }
        } else {
            liars++;
        }
    }

    if (isProbablyPrime || !state.abort) {
        const nMinus2 = n - two;
        const prng = mulberry32(state.seed);
        for (let i = 0; i < state.rounds; i++) {
            if (isWitness(getPseudoRandomInteger(two, nMinus2, prng))) {
                if (state.abort) {
                    break;
                } else {
                    witnesses++;
                }
            } else {
                liars++;
            }
        }
    }

    const identity = format === 'hexadecimal' ? '0x1' : '1';
    return <Fragment>
        <p className="text-center"><Integer integer={n} format={format}/> is {isProbablyPrime ? <Text.green>probably prime</Text.green> : <Text.red>certainly composite</Text.red>}.</p>
        {!state.abort && renderRatio(liars, witnesses)}
        <table className="text-right text-nowrap">
            <tr>
                <th>Candidate A:</th>
                {results.map(result => <td>{result[0].render(format)}</td>)}
            </tr>
            <tr>
                <th>A<Exponent exponent={<Fragment>n<MinusSign/>{identity}</Fragment>} parenthesesIfNotRaised/><ModuloSign/>n:</th>
                {results.map(result => <td>{result[1].isOne() ? <Text.green>{identity}</Text.green> : <Text.red>{result[1].render(format)}</Text.red>}</td>)}
            </tr>
        </table>
    </Fragment>;
}

const FermatPrimalityTest = store.injectCurrentState<{}>(RawFermatPrimalityTest);

export const toolIntegerFermatPrimalityTest: Tool = [
    <Fragment>
        <Input inColumns/>
        <FermatPrimalityTest/>
    </Fragment>,
    store,
];

/* ------------------------------ Miller-Rabin primality test ------------------------------ */

function RawMillerRabinPrimalityTest(state: Readonly<State>): JSX.Element {
    const format = determineIntegerFormat(state.input);
    const n = decodeInteger(state.input);
    const nMinus1 = n - one;

    let d = nMinus1;
    let c = 0;
    while (isEven(d)) {
        d = halve(d);
        c++;
    }

    const ring = new MultiplicativeRing(n);
    const positiveOne = format === 'hexadecimal' ? '0x1' : '1';
    const negativeOne = format === 'hexadecimal' ? <Fragment><MinusSign noSpaces/>0x1</Fragment> : <Fragment><MinusSign noSpaces/>1</Fragment>;

    function _isWitness(a: bigint, cells: JSX.Element[]): boolean {
        let x = ring.getElement(a).exponentiate(d);
        if (x.value === one) {
            cells.push(<td><Text.green>{positiveOne}</Text.green></td>);
            return false;
        } else if (x.value === nMinus1) {
            cells.push(<td><Text.green>{negativeOne}</Text.green></td>);
            return false;
        } else if (c === 1) {
            cells.push(<td><Text.red>{x.render(format)}</Text.red></td>);
        } else {
            cells.push(<td><Text.orange>{x.render(format)}</Text.orange></td>);
        }
        for (let i = c - 1; i !== 0; i--) {
            x = x.square();
            if (x.value === nMinus1) {
                cells.push(<td><Text.green>{negativeOne}</Text.green></td>);
                return false;
            } else {
                if (i === 1 || x.value === one) {
                    cells.push(<td><Text.red>{x.render(format)}</Text.red></td>);
                    return true;
                } else {
                    cells.push(<td><Text.orange>{x.render(format)}</Text.orange></td>);
                }
            }
        }
        return true;
    }

    const rows = new Array<JSX.Element>();
    let isProbablyPrime = true;

    function isWitness(a: bigint): boolean {
        const cells = new Array<JSX.Element>();
        cells.push(<td><Integer integer={a} format={format}/></td>);
        const result = _isWitness(a, cells);
        while (cells.length <= c) {
            cells.push(<td></td>);
        }
        rows.push(<tr>{cells}</tr>);
        if (result) {
            isProbablyPrime = false;
        }
        return result;
    }

    let liars = 0;
    let witnesses = 0;

    const candidates = decodeIntegerList(state.candidates);
    for (const candidate of candidates) {
        if (isWitness(candidate)) {
            if (state.abort) {
                break;
            } else {
                witnesses++;
            }
        } else {
            liars++;
        }
    }

    if (isProbablyPrime || !state.abort) {
        const nMinus2 = n - two;
        const prng = mulberry32(state.seed);
        for (let i = 0; i < state.rounds; i++) {
            if (isWitness(getPseudoRandomInteger(two, nMinus2, prng))) {
                if (state.abort) {
                    break;
                } else {
                    witnesses++;
                }
            } else {
                liars++;
            }
        }
    }

    return <Fragment>
        <p className="text-center"><Integer integer={n} format={format}/> is {isProbablyPrime ? <Text.green>probably prime</Text.green> : <Text.red>certainly composite</Text.red>}.</p>
        {!state.abort && renderRatio(liars, witnesses)}
        <table className="align">
            <tr><td className="text-right">n</td><td>=</td><td>2<Exponent exponent="c"/><MultiplicationSign/>d<AdditionSign/>1</td></tr>
            <tr><td className="text-right"><Integer integer={n} format={format}/></td><td>=</td><td>2<Exponent exponent={<Integer integer={c} format={format}/>}/><MultiplicationSign/><Integer integer={d} format={format}/><AdditionSign/>1</td></tr>
        </table>
        <table className="text-right text-nowrap">
            <thead>
                <tr>
                    <th>Candidate A</th>
                    {Array.from({ length: c }, (_, index) => <th>A<Exponent exponent={<Fragment>2<Exponent exponent={index}/><MultiplicationSign/>d</Fragment>} parenthesesIfNotRaised/><ModuloSign/>n</th>)}
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    </Fragment>;
}

const MillerRabinPrimalityTest = store.injectCurrentState<{}>(RawMillerRabinPrimalityTest);

export const toolIntegerMillerRabinPrimalityTest: Tool = [
    <Fragment>
        <Input inColumns/>
        <MillerRabinPrimalityTest/>
    </Fragment>,
    store,
];
