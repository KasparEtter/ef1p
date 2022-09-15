/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { Color } from '../../utility/color';

import { DynamicEntries } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { EllipticCurveElement } from '../../math/elliptic-curve';

import { a, b, EllipticCurveState, getEllipticCurve, modulusBelow100 } from '../utility/elliptic-curve';
import { renderFactorization } from '../utility/factors';

import { modulusInputWidth, oneColor, OperationTable, rootColor } from './utility';

/* ------------------------------ Input ------------------------------ */

type State = EllipticCurveState;

const entries: DynamicEntries<State> = {
    p: { ...modulusBelow100, inputWidth: modulusInputWidth },
    a: { ...a, inputWidth: modulusInputWidth },
    b: { ...b, inputWidth: modulusInputWidth },
};

const store = new VersionedStore(entries, 'table-elliptic-curve-operation');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function color(element: EllipticCurveElement): Color | undefined {
    if (element.isIdentity()) {
        return oneColor;
    } else if (element.y.isZero()) {
        return rootColor;
    } else {
        return undefined;
    }
}

function RawOutput(state: Readonly<State>): JSX.Element {
    const curve = getEllipticCurve(state);
    const elements = curve.getAllElements();
    return <Fragment>
        <p className="table-title">{curve.render()} with {elements.length} points ({renderFactorization(elements.length)})</p>
        <OperationTable<EllipticCurveElement>
            symbol="+"
            elements={elements}
            operation={(element1: EllipticCurveElement, element2: EllipticCurveElement) => element1.combine(element2)}
            headColor={color}
            cellColor={color}
            tableClass="text-center"
        />
    </Fragment>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolTableEllipticCurveOperation: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
