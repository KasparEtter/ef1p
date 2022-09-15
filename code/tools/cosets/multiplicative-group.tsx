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

import { MultiplicativeGroup, MultiplicativeGroupElement } from '../../math/multiplicative-group';
import { areCoprime } from '../../math/utility';

import { modulus, modulusInputWidth } from '../table/utility';

import { CosetState, delay, getCosetOutputStore, RawCosetOutput, unique, updateCosetOutput } from './utility';

/* ------------------------------ Input ------------------------------ */

const element: DynamicNumberEntry<State> = {
    label: 'Element',
    tooltip: 'The element whose subgroup you want to generate.',
    defaultValue: 3,
    inputType: 'number',
    inputWidth: modulusInputWidth,
    minValue: 1,
    maxValue: inputs => inputs.modulus - 1,
    dependencies: 'modulus',
    validateDependently: (input: number, { modulus }: State) => !areCoprime(BigInt(modulus), BigInt(input)) && 'The element is not coprime with the modulus.',
};

interface State extends CosetState {
    modulus: number;
    element: number;
}

const entries: DynamicEntries<State> = {
    modulus,
    element,
    unique,
    delay,
};

const store = new VersionedStore(entries, 'cosets-multiplicative-group', updateOutput);
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

const outputStore = getCosetOutputStore<MultiplicativeGroup, MultiplicativeGroupElement>('square-cells');
const Output = outputStore.injectState<{}>(RawCosetOutput);

// The old state is used only to determine whether the output shall be animated.
function updateOutput(newState: Readonly<State>, oldState?: Readonly<State>): void {
    const element = new MultiplicativeGroup(BigInt(newState.modulus)).getElement(BigInt(newState.element));
    updateCosetOutput(element, newState, outputStore, oldState === undefined);
}

updateOutput(store.getCurrentState());

/* ------------------------------ Tool ------------------------------ */

export const toolCosetsMultiplicativeGroup: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
