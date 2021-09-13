/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { decodeEncodedWord, encodeEncodedWordIfNecessary } from '../../utility/encoding';

import { DynamicEntry } from '../../react/entry';
import { getInput } from '../../react/input';
import { DynamicEntries, getPersistedStore } from '../../react/state';

/* ------------------------------ Entry updates ------------------------------ */

function encode(): void {
    const inputs = store.state.inputs;
    inputs.encoded = encodeEncodedWordIfNecessary(inputs.decoded);
    store.update('input');
}

function decode(): void {
    const inputs = store.state.inputs;
    inputs.decoded = decodeEncodedWord(inputs.encoded);
    store.update('input');
}

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 310;

const decoded: DynamicEntry<string, State> = {
    name: 'Decoded',
    description: 'The decoded word.',
    defaultValue: '¡Buenos días!',
    inputType: 'text',
    labelWidth: 68,
    inputWidth,
    onInput: encode,
};

const encoded: DynamicEntry<string, State> = {
    name: 'Encoded',
    description: 'The encoded word.',
    defaultValue: '=?ISO-8859-1?Q?=A1Buenos_d=EDas!?=',
    inputType: 'textarea',
    labelWidth: 66,
    inputWidth,
    rows: 2,
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

const store = getPersistedStore(entries, 'encoding-encoded-word');
const Input = getInput(store);

/* ------------------------------ User interface ------------------------------ */

export const toolEncodingEncodedWord = <Input/>;
