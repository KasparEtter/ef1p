/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { Color } from '../../utility/color';

import { ClickToCopy } from '../../react/copy';
import { DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { Text } from '../../react/text';
import { MinimalVersion } from '../../react/utility';
import { VersionedStore } from '../../react/versioned-store';

import { AdditionSign, DivisionSign, Exponent, Integer, MinusSign, MultiplicationSign } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat } from '../../math/integer';
import { max, min, modulo, one, zero } from '../../math/utility';

import { integerGreaterOne } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

export const a: DynamicTextEntry<State> = {
    ...integerGreaterOne,
    label: 'Integer a',
    defaultValue: '51',
};

export const b: DynamicTextEntry<State> = {
    ...integerGreaterOne,
    label: 'Integer b',
    defaultValue: '21',
};

interface State {
    a: string;
    b: string;
}

const entries: DynamicEntries<State> = {
    a,
    b,
};

const store = new VersionedStore(entries, 'integer-extended-euclidean-algorithm');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State & MinimalVersion>): JSX.Element {
    const format = determineIntegerFormat(state.a);
    const a = decodeInteger(state.a);
    const b = decodeInteger(state.b);
    const larger = max(a, b);
    const smaller = min(a, b);
    const quotients = new Array<bigint>();
    const remainders = [larger, smaller];
    const coefficientsOfLarger = [one, zero];
    const coefficientsOfSmaller = [zero, one];
    const arrays = [remainders, coefficientsOfLarger, coefficientsOfSmaller];
    for (let index = 1; remainders[index] !== zero; index++) {
        const quotient = remainders[index - 1] / remainders[index];
        quotients.push(quotient);
        for (const array of arrays) {
            array.push(array[index - 1] - quotient * array[index]);
        }
    }
    const indexOfInterest = remainders.length - 2;
    const gcd = <Integer integer={remainders[indexOfInterest]} format={format} color={remainders[indexOfInterest] === one ? 'green' : 'red'}/>;
    const integerColors: Color[] = ['pink', 'purple'];
    return <Fragment>
        <table className="text-right text-nowrap table-with-vertical-border-after-column-2">
            <thead>
                <tr>
                    <th>Step</th>
                    <th>Quotient</th>
                    <th>Remainder</th>
                    <th>=</th>
                    <th>…<MultiplicationSign/><Integer integer={larger} format={format} color="pink"/></th>
                    <th><AdditionSign noSpaces/></th>
                    <th>…<MultiplicationSign/><Integer integer={smaller} format={format} color="purple"/></th>
                </tr>
            </thead>
            <tbody>
                {remainders.map((_, index) => <tr>
                    <td>{index >= 2 && (index - 1)}</td>
                    <td>{quotients[index - 1] !== undefined && <Fragment><MinusSign noSpaces/> <Integer integer={quotients[index - 1]} format={format}/> <MultiplicationSign noSpaces/></Fragment>}</td>
                    <td><Integer integer={remainders[index]} format={format} color={index === indexOfInterest ? (remainders[index] === one ? 'green' : 'red') : integerColors[index]}/></td>
                    <td></td>
                    <td><Integer integer={coefficientsOfLarger[index]} format={format}/></td>
                    <td></td>
                    <td><Integer integer={coefficientsOfSmaller[index]} format={format} color={index === indexOfInterest && remainders[index] === one ? 'blue' : undefined}/></td>
                </tr>)}
            </tbody>
        </table>
        <table className="list">
            <tr><th>Greatest common divisor:</th><td>gcd(<Integer integer={larger} format={format} color="pink"/>, <Integer integer={smaller} format={format} color="purple"/>) = <ClickToCopy>{gcd}</ClickToCopy></td></tr>
            {!state.minimal && <tr><th>Least common multiple:</th><td>lcm(<Integer integer={larger} format={format} color="pink"/>, <Integer integer={smaller} format={format} color="purple"/>) = <Integer integer={larger} format={format} color="pink"/><MultiplicationSign/><Integer integer={smaller} format={format} color="purple"/><DivisionSign/>{gcd} = <ClickToCopy><Integer integer={a * b / remainders[indexOfInterest]} format={format}/></ClickToCopy></td></tr>}
            <tr><th>Multiplicative inverse:</th><td>{remainders[indexOfInterest] === one ? <Fragment><Integer integer={smaller} format={format} color="purple"/><Exponent exponent={<Integer integer={-1} format={format}/>} parenthesesIfNotRaised/> =<sub><Integer integer={larger} format={format} color="pink"/></sub> <ClickToCopy><Integer integer={modulo(coefficientsOfSmaller[indexOfInterest], larger)} format={format} color="blue"/></ClickToCopy></Fragment> : <Text.gray>[does not exist]</Text.gray>}</td></tr>
            {!state.minimal && <tr><th>Bézout's identity:</th><td><ClickToCopy>{gcd} = <Integer integer={coefficientsOfLarger[indexOfInterest]} format={format} parenthesesIfNegative/><MultiplicationSign/><Integer integer={larger} format={format} color="pink"/> + <Integer integer={coefficientsOfSmaller[indexOfInterest]} format={format} parenthesesIfNegative color={remainders[indexOfInterest] === one ? 'blue' : undefined}/><MultiplicationSign/><Integer integer={smaller} format={format} color="purple"/></ClickToCopy></td></tr>}
        </table>
    </Fragment>;
}

const Output = store.injectCurrentState<MinimalVersion>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolIntegerExtendedEuclideanAlgorithm: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];

export const toolIntegerExtendedEuclideanAlgorithmMinimal: Tool = [
    <Fragment>
        <Input entries={{
            a: {...a, inputWidth: 280 },
            b: {...b, inputWidth: 280 },
        }}/>
        <Output minimal/>
    </Fragment>,
    store,
];
