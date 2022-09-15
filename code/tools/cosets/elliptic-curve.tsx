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

import { EllipticCurve, EllipticCurveElement } from '../../math/elliptic-curve';

import { a, Ax, Ay, b, EllipticCurveState, getEllipticCurve, modulusBelow100 } from '../utility/elliptic-curve';

import { CosetState, delay, getCosetOutputStore, RawCosetOutput, unique, updateCosetOutput } from './utility';

/* ------------------------------ Input ------------------------------ */

interface State extends CosetState, EllipticCurveState {
    Ax: string,
    Ay: boolean,
}

const entries: DynamicEntries<State> = {
    p: modulusBelow100,
    a,
    b,
    Ax: { ...Ax, defaultValue: '0' },
    Ay,
    unique,
    delay,
};

const store = new VersionedStore(entries, 'cosets-elliptic-curve', updateOutput);
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

const outputStore = getCosetOutputStore<EllipticCurve, EllipticCurveElement>('text-center');
const Output = outputStore.injectState<{}>(RawCosetOutput);

// The old state is used only to determine whether the output shall be animated.
function updateOutput(newState: Readonly<State>, oldState?: Readonly<State>): void {
    const element = getEllipticCurve(newState).getElementFromStringX(newState.Ax, newState.Ay)!;
    updateCosetOutput(element, newState, outputStore, oldState === undefined);
}

updateOutput(store.getCurrentState());

/* ------------------------------ Tool ------------------------------ */

export const toolCosetsEllipticCurve: Tool = [
    <Fragment>
        <Input inColumns/>
        <Output/>
    </Fragment>,
    store,
];
