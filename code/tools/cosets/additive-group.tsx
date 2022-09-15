/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { DynamicEntries, DynamicNumberEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { AdditiveGroup, AdditiveGroupElement } from '../../math/additive-group';

import { modulus, modulusInputWidth } from '../table/utility';
import { CosetState, delay, getCosetOutputStore, RawCosetOutput, unique, updateCosetOutput } from './utility';

/* ------------------------------ Input ------------------------------ */

const element: DynamicNumberEntry<State> = {
    label: 'Element',
    tooltip: 'The element whose subgroup you want to generate.',
    defaultValue: 3,
    inputType: 'number',
    inputWidth: modulusInputWidth,
    minValue: 0,
    maxValue: inputs => inputs.modulus - 1,
};

interface State extends CosetState {
    modulus: number;
    element: number;
}

const entries: DynamicEntries<State> = {
    modulus: { ...modulus, defaultValue: 9 },
    element,
    unique,
    delay,
};

const store = new VersionedStore(entries, 'cosets-additive-group', updateOutput);
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

const outputStore = getCosetOutputStore<AdditiveGroup, AdditiveGroupElement>('square-cells');
const Output = outputStore.injectState<{}>(RawCosetOutput);

// The old state is used only to determine whether the output shall be animated.
function updateOutput(newState: Readonly<State>, oldState?: Readonly<State>): void {
    const element = new AdditiveGroup(BigInt(newState.modulus)).getElement(BigInt(newState.element));
    updateCosetOutput(element, newState, outputStore, oldState === undefined);
}

updateOutput(store.getCurrentState());

/* ------------------------------ Tool ------------------------------ */

export const toolCosetsAdditiveGroup: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
