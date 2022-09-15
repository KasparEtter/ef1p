/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { ClickToCopy } from '../../react/copy';
import { DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { AdditionSign, DivisionSign, encodeInteger, Exponent, Integer, Inverse, MinusSign, MultiplicationSign } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat } from '../../math/integer';
import { MultiplicativeRing } from '../../math/multiplicative-ring';
import { minusOne, modulo, one, zero } from '../../math/utility';

import { determinePrimeIntegers, integer, integerGreaterOne, integerInputWidth, nonNegativeInteger } from '../utility/integer';
import { getWarningSymbol } from '../utility/warning';

/* ------------------------------ Input ------------------------------ */

/**
 * Modulus greater than one of arbitrary length with no other restrictions.
 */
const m: DynamicTextEntry = {
    ...integerGreaterOne,
    label: 'Modulus m',
    inputWidth: integerInputWidth / 3,
    determine: determinePrimeIntegers,
};

const element: DynamicTextEntry<State> = {
    ...nonNegativeInteger,
    tooltip: 'An element of the multiplicative ring.',
    dependencies: 'm',
    requireValidDependenciesForUpOrDown: true,
    onUpOrDown: (event, input, { m }) => encodeInteger(modulo(decodeInteger(input) + (event === 'up' ? one : minusOne), decodeInteger(m)), determineIntegerFormat(input)),
};

const a: DynamicTextEntry<State> = {
    ...element,
    label: 'Element a',
    defaultValue: '4',
};

const b: DynamicTextEntry<State> = {
    ...element,
    label: 'Element b',
    defaultValue: '7',
};

const e: DynamicTextEntry<State> = {
    ...integer,
    label: 'Exponent e',
};

interface State {
    m: string;
    a: string;
    b: string;
    e: string;
}

const entries: DynamicEntries<State> = {
    m,
    a,
    b,
    e,
};

const store = new VersionedStore(entries, 'ring-operations');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

const warningSymbol = getWarningSymbol('The inverse does not exist.');

function RawOutput(state: Readonly<State>): JSX.Element {
    const m = decodeInteger(state.m);
    const ring = new MultiplicativeRing(m);
    const a = ring.getElementFromString(state.a);
    const b = ring.getElementFromString(state.b);
    const hasInverse = b.isCoprimeWithModulus();
    const exponent = decodeInteger(state.e);
    const format = determineIntegerFormat(state.m);
    const abstractEquality = <sub>m</sub>;
    const concreteEquality = <sub><Integer integer={m} format={format}/></sub>;
    const _a = a.render(format);
    const _b = b.render(format);
    return <table className="list">
        <tr><th>a</th><td>={abstractEquality} <ClickToCopy>{_a}</ClickToCopy></td></tr>
        <tr><th>b</th><td>={abstractEquality} <ClickToCopy>{_b}</ClickToCopy></td></tr>
        <tr><th>a<AdditionSign/>b</th><td>={abstractEquality} {_a}<AdditionSign/>{_b} ={concreteEquality} <ClickToCopy>{a.add(b).render(format)}</ClickToCopy></td></tr>
        <tr><th><MinusSign noSpaces/>b</th><td>={abstractEquality} <MinusSign noSpaces/>{_b} ={concreteEquality} <ClickToCopy>{b.invertAdditively().render(format)}</ClickToCopy></td></tr>
        <tr><th>a<MinusSign/>b</th><td>={abstractEquality} {_a}<MinusSign/>{_b} ={concreteEquality} <ClickToCopy>{a.subtract(b).render(format)}</ClickToCopy></td></tr>
        <tr><th>a<MultiplicationSign/>b</th><td>={abstractEquality} {_a}<MultiplicationSign/>{_b} ={concreteEquality} <ClickToCopy>{a.multiply(b).render(format)}</ClickToCopy></td></tr>
        <tr><th>b{Inverse}</th><td>={abstractEquality} {_b}{Inverse} ={concreteEquality} {hasInverse ? <ClickToCopy>{b.invertMultiplicatively().render(format)}</ClickToCopy> : warningSymbol}</td></tr>
        <tr><th>a<DivisionSign/>b</th><td>={abstractEquality} {_a}<DivisionSign/>{_b} ={concreteEquality} {hasInverse ? <ClickToCopy>{a.divide(b).render(format)}</ClickToCopy> : warningSymbol}</td></tr>
        <tr><th>a<Exponent exponent="e"/></th><td>={abstractEquality} {_a}<Exponent exponent={<Integer integer={exponent} format={format}/>}/> ={concreteEquality} {a.isZero() && exponent < zero ? warningSymbol : <ClickToCopy>{a.exponentiate(exponent).render(format)}</ClickToCopy>}</td></tr>
    </table>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolRingOperations: Tool = [
    <Fragment>
        <Input newColumnAt={3}/>
        <Output/>
    </Fragment>,
    store,
];
