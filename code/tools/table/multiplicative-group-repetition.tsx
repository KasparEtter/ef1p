/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { DynamicEntries } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { MinimalVersion } from '../../react/utility';
import { VersionedStore } from '../../react/versioned-store';

import { MultiplicativeGroup, MultiplicativeGroupElement } from '../../math/multiplicative-group';
import { minusOne } from '../../math/utility';

import { renderFactorization } from '../utility/factors';

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
    modulus,
    coprime,
    repeat,
    order,
    totient,
};

const store = new VersionedStore(entries, 'table-multiplicative-group-repetition');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State & MinimalVersion>): JSX.Element {
    const group = new MultiplicativeGroup(BigInt(state.modulus));
    const groupOrder = Number(group.getRepetitionOrder()!);
    const root = group.getElement(minusOne);
    return <Fragment>
        {!state.minimal && <p className="table-title">{renderFactorization(state.modulus)}</p>}
        {state.minimal && <p className="table-title">
            |{group.render()}| = {groupOrder}
        </p>}
        <RepetitionTable<MultiplicativeGroupElement>
            elements={group.getAllElements(state.minimal || state.coprime)}
            operation={(element1: MultiplicativeGroupElement, element2: MultiplicativeGroupElement) => element1.combine(element2)}
            cellColor={element => element.isZero() ? zeroColor : element.isOne() ? oneColor : element.equals(root) ? rootColor : !element.isCoprimeWithModulus() ? nonCoprimeColor : undefined}
            tableClass="square-cells"
            groupOrder={groupOrder}
            elementOrder={element => element.getOrder()}
            indexOutput={index => <Fragment>A<sup>{index}</sup></Fragment>}
            indexColor={index => groupOrder % index === 0 ? oneColor : undefined}
            identity={group.identity}
            repeat={state.repeat}
            order={!state.minimal && state.order}
            totient={!state.minimal && state.totient}
        />
    </Fragment>;
}

const Output = store.injectCurrentState<MinimalVersion>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolTableMultiplicativeGroupRepetition: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];

export const toolTableMultiplicativeGroupRepetitionMinimal: Tool = [
    <Fragment>
        <Input entries={{ modulus, repeat }}/>
        <Output minimal/>
    </Fragment>,
    store,
];
