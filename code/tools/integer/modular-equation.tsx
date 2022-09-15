/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { sortIntegers } from '../../utility/array';

import { ClickToCopy } from '../../react/copy';
import { DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { join } from '../../react/utility';
import { VersionedStore } from '../../react/versioned-store';

import { AdditionSign, DivisionSign, Integer, MultiplicationSign } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat } from '../../math/integer';
import { bezoutsIdentity, modulo, zero } from '../../math/utility';

import { integer, integerGreaterOne } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

const a: DynamicTextEntry<State> = {
    ...integer,
    label: 'Integer a',
    defaultValue: '9',
};

const c: DynamicTextEntry<State> = {
    ...integer,
    label: 'Integer c',
    defaultValue: '12',
};

const m: DynamicTextEntry<State> = {
    ...integerGreaterOne,
    label: 'Modulus m',
    defaultValue: '15',
};

interface State {
    a: string;
    c: string;
    m: string;
}

const entries: DynamicEntries<State> = {
    a,
    c,
    m,
};

const store = new VersionedStore(entries, 'integer-modular-equation');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const format = determineIntegerFormat(state.m);
    const m = decodeInteger(state.m);
    const a = modulo(decodeInteger(state.a), m);
    const c = modulo(decodeInteger(state.c), m);
    const [b, n, d] = bezoutsIdentity(a, m);
    const x = modulo(b * c / d, m);
    const o = m / d;
    const xs = sortIntegers(Array.from({ length: Number(d) }, (_, i) => modulo(x + BigInt(i) * o, m)));

    return <table className="align">
        <tr>
            <td>d = gcd(a, m)</td>
            <td>= b<MultiplicationSign/>a<AdditionSign/>n<MultiplicationSign/>m</td>
        </tr>
        <tr>
            <td>d = gcd(<Integer integer={a} format={format}/>, <Integer integer={m} format={format}/>)</td>
            <td>= <Integer integer={b} format={format} parenthesesIfNegative/><MultiplicationSign/><Integer integer={a} format={format}/><AdditionSign/>
            <Integer integer={n} format={format} parenthesesIfNegative/><MultiplicationSign/><Integer integer={m} format={format}/> = <Integer integer={d} format={format}/></td>
        </tr>
        <tr className="padding-top">
            <td>a<MultiplicationSign/>x</td>
            <td>=<sub>m</sub> c</td>
        </tr>
        <tr>
            <td><Integer integer={a} format={format}/><MultiplicationSign/>x</td>
            <td>=<sub><Integer integer={m} format={format}/></sub> <Integer integer={c} format={format}/></td>
        </tr>
        {c % d === zero ? <Fragment>
            <tr className="padding-top">
                <td>x</td>
                <td>=<sub>m</sub> b<MultiplicationSign/>c<DivisionSign/>d</td>
            </tr>
            <tr>
                <td>x</td>
                <td>=<sub>m</sub> <Integer integer={b} format={format} parenthesesIfNegative/><MultiplicationSign/><Integer integer={c} format={format}/><DivisionSign/><Integer integer={d} format={format}/> =<sub><Integer integer={m} format={format}/></sub> <Integer integer={x} format={format}/></td>
            </tr>
            <tr className="padding-top">
                <td>o</td>
                <td>= m<DivisionSign/>d</td>
            </tr>
            <tr>
                <td>o</td>
                <td>= <Integer integer={m} format={format}/><DivisionSign/><Integer integer={d} format={format}/> = <Integer integer={o} format={format}/></td>
            </tr>
            <tr className="padding-top click-to-copy-padding-bottom">
                <td>x</td>
                <td>∈ {'{'}{join(xs.map(c => <ClickToCopy><Integer integer={c} format={format}/></ClickToCopy>))}{'}'}</td>
            </tr>
        </Fragment> : <tr className="padding-top">
            <td className="text-center" colSpan={2}>
                c = <Integer integer={c} format={format}/> is not a multiple of d = <Integer integer={d} format={format}/><br/>
                Therefore, no solutions exist for x.
            </td>
        </tr>}
    </table>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolIntegerModularEquation: Tool = [
    <Fragment>
        <Input inColumns/>
        <Output/>
    </Fragment>,
    store,
];
