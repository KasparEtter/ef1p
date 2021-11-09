/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { decodeExtendedParameter, encodeExtendedParameter } from '../../utility/encoding';

import { DynamicEntry } from '../../react/entry';
import { getInput } from '../../react/input';
import { DynamicEntries, getPersistedStore } from '../../react/state';
import { Tool } from '../../react/utility';

/* ------------------------------ Entry updates ------------------------------ */

function encode(): void {
    const inputs = store.state.inputs;
    inputs.encoded = encodeExtendedParameter(inputs.decoded);
    store.update('input');
}

function decode(): void {
    const inputs = store.state.inputs;
    inputs.decoded = decodeExtendedParameter(inputs.encoded);
    store.update('input');
}

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 290;
const rows = 3;

const decoded: DynamicEntry<string, State> = {
    name: 'Decoded',
    description: 'The parameter decoded according to RFC 2231.',
    defaultValue: 'filename="¡Buenos días!.txt"',
    inputType: 'textarea',
    inputWidth,
    rows,
    onInput: encode,
};

const encoded: DynamicEntry<string, State> = {
    name: 'Encoded',
    description: 'The parameter encoded according to RFC 2231.',
    defaultValue: "filename*=iso-8859-1'es'%A1Buenos%20d%EDas!.txt",
    inputType: 'textarea',
    inputWidth,
    rows,
    onInput: decode,
};

interface State {
    decoded: string;
    encoded: string;
}

const entries: DynamicEntries<State> = {
    decoded,
    encoded,
};

const store = getPersistedStore(entries, 'encoding-extended-parameter');
const Input = getInput(store);

/* ------------------------------ User interface ------------------------------ */

export const toolEncodingExtendedParameter: Tool = [<Input/>, store];
