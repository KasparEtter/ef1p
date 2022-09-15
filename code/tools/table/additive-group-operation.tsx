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

import { AdditiveGroup, AdditiveGroupElement } from '../../math/additive-group';
import { AdditionSign } from '../../math/formatting';

import { composite, compositeOutput, coprime, coprimeCellColor, headColor, modulus, OperationTable, renderCompositeModuli, zeroColor } from './utility';

/* ------------------------------ Input ------------------------------ */

interface State {
    modulus: number;
    coprime: boolean;
    composite: boolean;
}

const entries: DynamicEntries<State> = {
    modulus: { ...modulus, defaultValue: 10, minValue: 1 },
    coprime,
    composite,
};

const store = new VersionedStore(entries, 'table-additive-group-operation');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const modulus = BigInt(state.modulus);
    const group = new AdditiveGroup(modulus);
    return <Fragment>
        {state.composite && renderCompositeModuli(modulus)}
        <OperationTable<AdditiveGroupElement>
            symbol={<AdditionSign/>}
            elements={group.getAllElements(state.coprime)}
            operation={(element1: AdditiveGroupElement, element2: AdditiveGroupElement) => element1.combine(element2)}
            elementOutput={state.composite ? compositeOutput(modulus) : undefined}
            headColor={headColor}
            cellColor={state.coprime ? coprimeCellColor : (element => element.isIdentity() ? zeroColor : undefined)}
            tableClass={state.composite ? 'text-center' : 'square-cells'}
        />
    </Fragment>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolTableAdditiveGroupOperation: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
