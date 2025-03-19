/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { ClickToCopy } from '../../react/copy';
import { DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { Integer } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat } from '../../math/integer';
import { modulo } from '../../math/utility';

import { integer, integerGreaterOne } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

/**
 * Modulus greater than one of arbitrary length with no other restrictions.
 */
const modulus: DynamicTextEntry = {
    ...integerGreaterOne,
    label: 'Modulus',
    defaultValue: '12',
    inputWidth: 288,
};

interface State {
    integer: string;
    modulus: string;
}

const entries: DynamicEntries<State> = {
    integer: { ...integer, inputWidth: 288 },
    modulus,
};

const store = new VersionedStore(entries, 'integer-modulo');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const format = determineIntegerFormat(state.integer);
    const integer = decodeInteger(state.integer);
    const modulus = decodeInteger(state.modulus);
    return <table className="list text-right">
        <tr><th>Integer:</th><td><ClickToCopy><Integer integer={integer} format={format}/></ClickToCopy></td></tr>
        <tr><th>Modulus:</th><td><ClickToCopy><Integer integer={modulus} format={format}/></ClickToCopy></td></tr>
        <tr><th>Remainder:</th><td><ClickToCopy><Integer integer={modulo(integer, modulus)} format={format}/></ClickToCopy></td></tr>
    </table>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolIntegerModulo: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
