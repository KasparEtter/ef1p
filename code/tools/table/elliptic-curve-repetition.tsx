/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { DynamicEntries } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { EllipticCurveElement } from '../../math/elliptic-curve';

import { a, b, EllipticCurveState, getEllipticCurve, modulusBelow100 as p } from '../utility/elliptic-curve';
import { renderFactorization } from '../utility/factors';

import { oneColor, order, repeat, RepetitionTable, rootColor, totient } from './utility';

/* ------------------------------ Input ------------------------------ */

interface State extends EllipticCurveState {
    repeat: boolean;
    order: boolean;
    totient: boolean;
}

const entries: DynamicEntries<State> = {
    p,
    a,
    b,
    repeat,
    order,
    totient,
};

const store = new VersionedStore(entries, 'table-elliptic-curve-repetition');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const curve = getEllipticCurve(state);
    const elements = curve.getAllElements();
    return <Fragment>
        <p className="table-title">{curve.render()} with {elements.length} points ({renderFactorization(elements.length)})</p>
        <RepetitionTable<EllipticCurveElement>
            elements={elements}
            operation={(element1: EllipticCurveElement, element2: EllipticCurveElement) => element1.combine(element2)}
            cellColor={element => element.isIdentity() ? oneColor : element.y.isZero() ? rootColor : undefined}
            tableClass="text-center"
            groupOrder={elements.length}
            elementOrder={element => element.getOrder()}
            indexOutput={index => <Fragment>{index}A</Fragment>}
            indexColor={index => elements.length % index === 0 ? oneColor : undefined}
            identity={curve.identity}
            repeat={state.repeat}
            order={state.order}
            totient={state.totient}
        />
    </Fragment>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolTableEllipticCurveRepetition: Tool = [
    <Fragment>
        <Input inColumns/>
        <Output/>
    </Fragment>,
    store,
];
