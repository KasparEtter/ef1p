/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { DynamicBooleanEntry, DynamicEntries } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { MultiplicationSign } from '../../math/formatting';
import { MultiplicativeGroup, MultiplicativeGroupElement } from '../../math/multiplicative-group';
import { one, zero as _zero } from '../../math/utility';

import { cellColor, composite, compositeOutput, coprime, headColor, modulus, OperationTable, renderCompositeModuli } from './utility';

/* ------------------------------ Input ------------------------------ */

export const zero: DynamicBooleanEntry = {
    label: 'Zero',
    tooltip: 'Whether to include zero, which is useful to see the number of repetitions of non-coprime elements.',
    defaultValue: false,
    inputType: 'switch',
};

interface State {
    modulus: number;
    coprime: boolean;
    zero: boolean;
    composite: boolean;
}

const entries: DynamicEntries<State> = {
    modulus,
    coprime,
    zero,
    composite,
};

const store = new VersionedStore(entries, 'table-multiplicative-group-operation');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const modulus = BigInt(state.modulus);
    const group = new MultiplicativeGroup(modulus);
    return <Fragment>
        {state.composite && renderCompositeModuli(modulus)}
        <OperationTable<MultiplicativeGroupElement>
            symbol={<MultiplicationSign/>}
            elements={group.getAllElements(state.coprime, state.zero ? _zero : one)}
            operation={(element1: MultiplicativeGroupElement, element2: MultiplicativeGroupElement) => element1.combine(element2)}
            elementOutput={state.composite ? compositeOutput(modulus) : undefined}
            headColor={headColor}
            cellColor={cellColor}
            tableClass={state.composite ? 'text-center' : 'square-cells'}
        />
    </Fragment>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolTableMultiplicativeGroupOperation: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
