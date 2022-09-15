/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { ClickToCopy } from '../../react/copy';
import { DynamicEntries } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { Integer } from '../../math/formatting';
import { decodeInteger } from '../../math/integer';

import { integer } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

interface State {
    integer: string;
}

const entries: DynamicEntries<State> = {
    integer,
};

const store = new VersionedStore(entries, 'integer-conversion');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const integer = decodeInteger(state.integer);
    return <table className="list text-right">
        <tr><th>Decimal:</th><td><ClickToCopy><Integer integer={integer} format="decimal"/></ClickToCopy></td></tr>
        <tr><th>Hexadecimal:</th><td><ClickToCopy><Integer integer={integer} format="hexadecimal"/></ClickToCopy></td></tr>
    </table>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolIntegerConversion: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
