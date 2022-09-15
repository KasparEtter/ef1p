/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactElement } from 'react';

import { filterUndefined } from '../../utility/array';
import { Color, getColorClass } from '../../utility/color';
import { encodePercent } from '../../utility/string';

import { ClickToCopy } from '../../react/copy';
import { DetermineButton, DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { join } from '../../react/utility';
import { VersionedStore } from '../../react/versioned-store';

import { Factor, factorize } from '../../math/factorization';
import { AdditionSign, encodeInteger, Exponent, Integer, MinusSign, MultiplicationSign } from '../../math/formatting';
import { isMatrixInvertible, solveLinearEquations } from '../../math/gaussian-elimination';
import { decodeInteger, determineIntegerFormat, IntegerFormat, normalizeToInteger, ToInteger } from '../../math/integer';
import { MultiplicativeGroup, MultiplicativeGroupElement } from '../../math/multiplicative-group';
import { MultiplicativeRing, MultiplicativeRingElement } from '../../math/multiplicative-ring';
import { primes } from '../../math/prime';
import { getRandomInteger, one, zero } from '../../math/utility';

import { createMeteredAnimation, delay, minDelay, SetOutput } from '../utility/animation';
import { renderFactorsOrPrime } from '../utility/factors';
import { integerGreaterOne, integerInputWidth } from '../utility/integer';
import { A, getElement, m, MultiplicativeGroupState } from '../utility/multiplicative-group';

import { DiscreteLogarithmOutputState, DiscreteLogarithms, DiscreteLogarithmState, getSubgroupError, initialDiscreteLogarithmOutputState, k, renderDiscreteLogarithmProblem, updateFrequency } from './utility';

const G: DynamicTextEntry<State> = {
    ...A,
    label: 'Generator G',
    inputWidth: integerInputWidth - 72,
    stayEnabled: true,
};

function getGenerator(state: Readonly<State>): MultiplicativeGroupElement {
    return new MultiplicativeGroup(decodeInteger(state.m)).getElementFromString(state.G);
}

const n: DynamicTextEntry<State> = {
    ...integerGreaterOne,
    label: "G's order n",
    tooltip: 'The order n of the generator G.',
    defaultValue: '96',
    dependencies: ['m', 'G'],
    validateDependently: (input, inputs) => decodeInteger(input) < one && 'The order has to be at least 1.' ||
        decodeInteger(input) >= decodeInteger(inputs.m) && 'The order has to be smaller than the modulus.' ||
        !getGenerator(inputs).repeat(decodeInteger(input)).isIdentity() && 'The generator does not have this order.',
    derive: inputs => encodeInteger(getGenerator(inputs).getOrder(), determineIntegerFormat(inputs.m)),
};

const generateOutput: DetermineButton<string, State> = {
    label: 'Random',
    tooltip: 'Generates a random output of the linear one-way function.',
    requireValidDependencies: true,
    requireIndependentlyValidInput: true,
    onClick: async (input, inputs) => getGenerator(inputs).repeat(getRandomInteger(one, decodeInteger(inputs.n))).to(determineIntegerFormat(input)),
}

const K: DynamicTextEntry<State> = {
    ...A,
    label: 'Output K',
    defaultValue: '27',
    inputWidth: integerInputWidth - 72,
    dependencies: ['m', 'G', 'k'],
    validateDependently: (input, inputs) => decodeInteger(input) < one && 'The output has to be greater than 0.' ||
        decodeInteger(input) >= decodeInteger(inputs.m) && 'The output has to smaller than the modulus.' ||
        !getElement(input, inputs).isCoprimeWithModulus() && 'The output has to be coprime with the modulus.',
    derive: inputs => getGenerator(inputs).repeat(decodeInteger(inputs.k)).to(determineIntegerFormat(inputs.m)),
    determine: generateOutput,
};

interface State extends DiscreteLogarithmState, MultiplicativeGroupState {
    G: string;
}

const entries: DynamicEntries<State> = {
    m,
    G,
    n,
    k,
    K,
    d: delay,
};

const store = new VersionedStore(entries, 'discrete-logarithm-multiplicative-group');
const Input = getInput(store);

export const toolDiscreteLogarithmMultiplicativeGroup = new DiscreteLogarithms<State, MultiplicativeGroup, MultiplicativeGroupElement>(
    store,
    getGenerator,
    'multiplicative-group',
    (G, n, format) => {
        function e(integer: number | bigint | ToInteger): string {
            return encodePercent(encodeInteger(integer, format));
        }
        return `&m=${e(G.group.modulus)}&G=${e(G)}&n=${e(n)}`;
    },
);

/* ------------------------------ Index-calculus algorithm ------------------------------ */

interface OutputState extends DiscreteLogarithmOutputState<MultiplicativeGroup, MultiplicativeGroupElement> {
    m: bigint;
    mFactors?: Factor[] | null;
    n: bigint;
    nFactors?: Factor[] | null;
    length: number;
    vector?: MultiplicativeRingElement[];
    elements?: MultiplicativeGroupElement[];
    matrix?: MultiplicativeRingElement[][];
    attemptExponent?: MultiplicativeRingElement | undefined;
    attemptElement?: MultiplicativeGroupElement;
    attemptExponents?: bigint[];
    attemptSuccess?: boolean;
    solution?: MultiplicativeRingElement[];
    results?: MultiplicativeGroupElement[];
    exponent?: MultiplicativeRingElement;
    element?: MultiplicativeGroupElement;
    exponents?: MultiplicativeRingElement[];
    correct?: boolean;
    minWidth: number;
}

const baseColor: Color = 'blue';
const vectorColor: Color = 'pink';
const matrixColor: Color = 'purple';
const solutionColor: Color = 'orange';
const offsetColor: Color = 'yellow';
const exponentColor: Color = 'brown';

function renderFactorization(
    exponents: (bigint | MultiplicativeRingElement)[],
    format: IntegerFormat,
    complete = true,
    color?: Color,
): JSX.Element {
    return <Fragment>
        {join(filterUndefined(
            exponents.map((exponent, index) => normalizeToInteger(exponent) === zero ? undefined :
                <Fragment>
                    <Integer integer={primes[index]} format={format} color={color ? baseColor : undefined}/>
                    <Exponent exponent={<Integer integer={exponent} format={format} color={color}/>}/>
                </Fragment>),
        ), <MultiplicationSign/>)}
        {!complete && <Fragment><MultiplicationSign/>…</Fragment>}
    </Fragment>;
}

function renderRow(
    G: MultiplicativeGroupElement,
    exponent: MultiplicativeRingElement,
    element: MultiplicativeGroupElement,
    exponents: (bigint | MultiplicativeRingElement)[],
    format: IntegerFormat,
    complete = true,
    color = true,
): JSX.Element {
    return <Fragment>
        <td>
            {G.renderRepetition(exponent.toInteger(), format, false, color ? vectorColor : undefined)}
        </td>
        <td>
            {G.group.renderConcreteEquality(format)}
        </td>
        <td className="text-right">
            {element.render(format)}
        </td>
        <td>
            = {renderFactorization(exponents, format, complete, color ? matrixColor : undefined)}
        </td>
    </Fragment>;
}

function renderMatrix(
    matrix: MultiplicativeRingElement[][] | MultiplicativeRingElement[],
    format: IntegerFormat,
    color?: Color,
): JSX.Element {
    return <table className="matrix">
        {matrix.map(row => <tr>
            <td></td>
            {Array.isArray(row) ?
                row.map(cell => <td><Integer integer={cell} format={format} color={color}/></td>) :
                <td><Integer integer={row} format={format} color={color}/></td>}
            <td></td>
        </tr>)}
    </table>;
}

function render(state: Readonly<OutputState>): ReactElement {
    const group = state.G!.group;
    return <Fragment>
        {renderDiscreteLogarithmProblem(state)}
        <table className="align">
            {state.mFactors && <tr><td>Modulus m: <Integer integer={state.m} format={state.format}/></td><td>{renderFactorsOrPrime(state.mFactors!)}</td></tr>}
            {state.nFactors && <tr><td>G's order n: <Integer integer={state.n} format={state.format}/></td><td>{renderFactorsOrPrime(state.nFactors!)}</td></tr>}
        </table>
        <p className="text-center">
            {state.length} prime bases: {join(primes.slice(0, state.length).map(prime => <Integer integer={prime} color={baseColor}/>))}
        </p>
        {(state.vector || state.attemptExponent) && <table className="align text-nowrap">
            <tr>
                <td colSpan={4} className="text-center">{state.vector?.length ?? 0} equations:</td>
            </tr>
            {(state.vector ?? []).map((exponent, row) => <tr>
                {renderRow(state.G!, exponent, state.elements![row], state.matrix![row], state.format)}
            </tr>)}
            {state.attemptExponent && <tr className={getColorClass(state.attemptSuccess ? 'green' : 'red')}>
                {renderRow(state.G!, state.attemptExponent, state.attemptElement!, state.attemptExponents!, state.format, state.attemptSuccess!, false)}
            </tr>}
        </table>}
        {state.solution && <p className="equation">
            {renderMatrix(state.matrix!, state.format, matrixColor)}
            <MultiplicationSign noSpaces/>
            {renderMatrix(state.solution!, state.format, solutionColor)}
            =<sub><Integer integer={state.n} format={state.format}/></sub>
            {renderMatrix(state.vector!, state.format, vectorColor)}
        </p>}
        {state.results && <table className="align">
            {state.results.map((result, index) => <tr>
                <td>{state.G!.renderRepetition(state.solution![index].toInteger(), state.format, false, solutionColor)}</td>
                <td>{group.renderConcreteEquality(state.format)} {result.render(state.format, result.toInteger() === primes[index] ? 'green' : 'red')}</td>
            </tr>)}
        </table>}
        {state.exponent && <p className="text-center">
            K <MultiplicationSign/> {group.renderRepetition('G', 'c')} {group.renderAbstractEquality('m')} {' '}
            {state.K!.render(state.format)} <MultiplicationSign/> {state.G!.renderRepetition(state.exponent!.toInteger(), state.format, false, state.k !== undefined ? offsetColor : 'red')} {' '}
            {group.renderConcreteEquality(state.format)} {' '}
            <span className="d-inline-block text-left" style={{ minWidth: state.k !== undefined ? 0 : state.minWidth }}>
                {state.element!.render(state.format)}
                {!state.element!.isIdentity() && <Fragment>
                    {' '} = <span className={getColorClass(state.k ? undefined : 'red')}>{renderFactorization(state.exponents!, state.format, state.k !== undefined, state.k !== undefined ? exponentColor : undefined)}</span>
                </Fragment>}
            </span>
        </p>}
        {state.k !== undefined && <p className="text-center">
            k =<sub><Integer integer={state.n} format={state.format}/></sub> {' '}
            {join(filterUndefined(
                state.exponents!.map((exponent, index) => exponent.isZero()? undefined : <Fragment>
                    <Integer integer={exponent} format={state.format} color={exponentColor}/><MultiplicationSign/>
                    <Integer integer={state.solution![index]} format={state.format} color={solutionColor}/>
                </Fragment>),
            ), <AdditionSign/>)} {' '}
            <MinusSign noSpaces={state.element!.isIdentity()}/><Integer integer={state.exponent!} format={state.format} color={offsetColor}/> {' '}
            =<sub><Integer integer={state.n} format={state.format}/></sub> <ClickToCopy><Integer integer={state.k!} format={state.format} color={state.correct ? 'green' : 'red'}/></ClickToCopy>
            <i className={'ml-2 fas ' + (state.correct ? 'fa-check color-green' : 'fa-times color-red') }></i>
        </p>}
    </Fragment>;
}

async function run(state: Readonly<State>, setOutput: SetOutput<OutputState>): Promise<void> {
    const delay = state.d * 1000;
    const G = getGenerator(state);
    const K = G.group.getElementFromString(state.K);
    const m = decodeInteger(state.m);
    const mFactors = factorize(m);
    const n = decodeInteger(state.n);
    const nFactors = factorize(n);
    const ring = new MultiplicativeRing(n);
    const length = Math.min(Math.round(Math.log(Number(n))), primes.length);
    const bases = primes.slice(0, length);
    const format = determineIntegerFormat(state.n);
    await setOutput(delay || minDelay, { G, K, m, mFactors, n, nFactors, length, format });

    let steps = zero;
    const vector: MultiplicativeRingElement[] = [];
    const elements: MultiplicativeGroupElement[] = [];
    const matrix: MultiplicativeRingElement[][] = [];
    let attemptExponent = ring.zero;
    let attemptElement = G.group.identity;
    let attemptExponents: bigint[] = [];
    let attemptSuccess = false;
    while (true) {
        if (attemptSuccess) {
            vector.push(attemptExponent);
            elements.push(attemptElement);
            matrix.push(attemptExponents.map(exponent => ring.getElement(exponent)));
            if (matrix.length >= length && isMatrixInvertible(matrix)) {
                break;
            }
            if (matrix.length === 10 * length) {
                // isMatrixInvertible(matrix, 2);
                await setOutput(0, { error: 'The matrix seems to remain non-invertible for this tool.' });
                return;
            }
            if (delay === 0) {
                await setOutput(minDelay, { steps, vector, elements, matrix, attemptExponent: undefined });
            }
        }
        steps++;
        attemptExponent = attemptExponent.add(ring.one);
        if (attemptExponent.isZero()) {
            await setOutput(0, { error: 'Could not find enough equations to make the matrix invertible.' });
            return;
        }
        attemptElement = attemptElement.combine(G);
        let integer = attemptElement.value;
        attemptExponents = [];
        for (const base of bases) {
            let exponent = zero;
            while (integer % base === zero) {
                integer /= base;
                exponent++;
            }
            attemptExponents.push(exponent);
        }
        attemptSuccess = integer === one;
        if (delay > 0 || steps % updateFrequency === zero) {
            await setOutput(delay || minDelay, { steps, vector, elements, matrix, attemptExponent, attemptElement, attemptExponents, attemptSuccess });
        }
    }
    const solution = solveLinearEquations(matrix, vector);
    const results = solution.map(element => G.repeat(element));
    const minWidth = G.group.estimateMaxElementWidth(format) * 4;
    await setOutput(delay || minDelay, { steps, vector, elements, matrix, attemptExponent: undefined, solution, results, minWidth });
    let exponent = ring.zero;
    let element = K;
    while (true) {
        let integer = element.value;
        const exponents: MultiplicativeRingElement[] = [];
        for (const base of bases) {
            let exponent = zero;
            while (integer % base === zero) {
                integer /= base;
                exponent++;
            }
            exponents.push(ring.getElement(exponent));
        }
        if (integer === one) {
            const k = exponents.map((exponent, index) => exponent.multiply(solution[index])).reduce((sum, value) => sum.add(value), ring.zero).subtract(exponent).toInteger();
            const correct = G.repeat(k).equals(K);
            await setOutput(0, { exponent, element, exponents, k, correct, error: correct ? undefined : getSubgroupError(G, K, format, true) });
            return;
        } else {
            if (delay > 0) {
                await setOutput(delay, { exponent, element, exponents });
            }
            steps++;
            exponent = exponent.add(ring.one);
            if (exponent.isZero()) { // If K is in the subgroup generated by G, this should never happen at this point.
                await setOutput(0, { error: 'Could not find a smooth element.' });
                return;
            }
            element = element.combine(G);
        }
    }
}

const [search, Output] = createMeteredAnimation(
    {
        ...initialDiscreteLogarithmOutputState,
        m: zero,
        n: zero,
        length: 0,
        minWidth: 0,
    },
    state => state.G !== undefined,
    render,
    run,
);

export const toolDiscreteLogarithmMultiplicativeGroupIndexCalculusAlgorithm: Tool = [
    <Fragment>
        <Input entries={{
            ...store.entries,
            k: undefined,
        }} submit={{
            label: 'Search',
            tooltip: 'Search for the input k which produces the given output K.',
            onClick: search,
        }} inColumns/>
        <Output/>
    </Fragment>,
    store,
    search,
];
