/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { ClickToCopy } from '../../react/copy';
import { DynamicEntries } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { AdditionSign, Integer, MinusSign } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat } from '../../math/integer';

import { a, Ax, Ay, b, EllipticCurveState, getEllipticCurve, p } from '../utility/elliptic-curve';
import { integer } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

interface State extends EllipticCurveState {
    Ax: string;
    Ay: boolean;
    Bx: string;
    By: boolean;
    c: string;
}

const entries: DynamicEntries<State> = {
    p,
    a,
    b,
    Ax: { ...Ax, defaultValue: '1', determine: undefined },
    Ay,
    Bx: { ...Ax, label: 'B x value', defaultValue: '1', determine: undefined },
    By: { ...Ay, label: 'B y even' },
    c: { ...integer, label: 'Coefficient c' },
};

const store = new VersionedStore(entries, 'elliptic-curve-operations');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const curve = getEllipticCurve(state);
    const A = curve.getElementFromStringX(state.Ax, state.Ay)!;
    const B = curve.getElementFromStringX(state.Bx, state.By)!;
    const Bi = B.invert();
    const c = decodeInteger(state.c);
    const format = determineIntegerFormat(state.p);
    const _A = A.render(format);
    const _B = B.render(format);
    return <Fragment>
        <p className="table-title">Elliptic curve: {curve.render(format)}</p>
        <table className="list">
            <tr><th>A</th><td>= <ClickToCopy>{_A}</ClickToCopy></td></tr>
            <tr><th>B</th><td>= <ClickToCopy>{_B}</ClickToCopy></td></tr>
            <tr><th>A<AdditionSign/>B</th><td>= {_A}<AdditionSign/>{_B} = <ClickToCopy>{A.combine(B).render(format)}</ClickToCopy></td></tr>
            <tr><th><MinusSign noSpaces/>B</th><td>= <MinusSign noSpaces/>{_B} = <ClickToCopy>{Bi.render(format)}</ClickToCopy></td></tr>
            <tr><th>A<MinusSign/>B</th><td>= {_A}<MinusSign/>{_B} = <ClickToCopy>{A.combine(Bi).render(format)}</ClickToCopy></td></tr>
            <tr><th>cA</th><td>= <Integer integer={c} format={format}/>{_A} = <ClickToCopy>{A.repeat(c).render(format)}</ClickToCopy></td></tr>
        </table>
    </Fragment>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolEllipticCurveOperations: Tool = [
    <Fragment>
        <Input newColumnAt={5}/>
        <Output/>
    </Fragment>,
    store,
];
