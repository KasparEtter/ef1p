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

import { coprime, modulus, nonCoprimeColor, oneColor, order, repeat, RepetitionTable, rootColor, totient, zeroColor } from './utility';

/* ------------------------------ Input ------------------------------ */

interface State {
    modulus: number;
    coprime: boolean;
    repeat: boolean;
    order: boolean;
    totient: boolean;
}

const entries: DynamicEntries<State> = {
    modulus: { ...modulus, defaultValue: 10, minValue: 1 },
    coprime,
    repeat,
    order,
    totient,
};

const store = new VersionedStore(entries, 'table-additive-group-repetition');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const group = new AdditiveGroup(BigInt(state.modulus));
    const groupOrder = state.modulus;
    const root = groupOrder % 2 === 0 ? group.getElement(BigInt(groupOrder / 2)) : undefined;
    return <Fragment>
        <RepetitionTable<AdditiveGroupElement>
            elements={group.getAllElements(state.coprime)}
            operation={(element1: AdditiveGroupElement, element2: AdditiveGroupElement) => element1.combine(element2)}
            cellColor={element => element.isZero() ? zeroColor : element.isOne() ? oneColor : root !== undefined && element.equals(root) ? rootColor : state.coprime && !element.isCoprimeWithModulus() ? nonCoprimeColor : undefined}
            tableClass="square-cells"
            groupOrder={groupOrder}
            elementOrder={element => element.getOrder()}
            indexOutput={index => <Fragment>{index}A</Fragment>}
            indexColor={index => groupOrder % index === 0 ? zeroColor : undefined}
            identity={group.identity}
            repeat={state.repeat}
            order={state.order}
            totient={state.totient}
        />
    </Fragment>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolTableAdditiveGroupRepetition: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
