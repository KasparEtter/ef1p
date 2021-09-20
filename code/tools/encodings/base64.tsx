/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Charset, decodeBase64, encodeBase64WithLineLengthLimit, isInLatin1Range } from '../../utility/encoding';

import { DynamicEntry } from '../../react/entry';
import { getInput } from '../../react/input';
import { DynamicEntries, getPersistedStore, mergeIntoCurrentState } from '../../react/state';

/* ------------------------------ Entry updates ------------------------------ */

function encode(): void {
    const inputs = store.state.inputs;
    inputs.lastInput = 'decoded';
    inputs.encoded = encodeBase64WithLineLengthLimit(inputs.decoded, inputs.charset as Charset);
}

function onDecodedInput(): void {
    encode();
    store.update('input');
}

function decode(): void {
    const inputs = store.state.inputs;
    inputs.lastInput = 'encoded';
    inputs.decoded = decodeBase64(inputs.encoded, inputs.charset as Charset);
}

const encodedRegex = /^[\sa-zA-Z0-9+/]*(=\s*){0,2}$/;
const encodedError = 'This is not a valid Base64 string.';

function onEncodedInput(): void {
    if (encodedRegex.test(store.state.inputs.encoded)) {
        decode();
    } else {
        store.state.errors.encoded = encodedError;
    }
    store.update('input');
}

function onCharsetChange(): void {
    if (store.state.inputs.lastInput === 'decoded') {
        encode();
    } else {
        decode();
    }
    mergeIntoCurrentState(store);
}

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 210;
const rows = 3;

const decoded: DynamicEntry<string, State> = {
    name: 'Decoded',
    description: 'The Base64-decoded string.',
    defaultValue: '¡Buenos días!',
    inputType: 'textarea',
    inputWidth,
    rows,
    onInput: onDecodedInput,
};

const encoded: DynamicEntry<string, State> = {
    name: 'Encoded',
    description: 'The Base64-encoded string.',
    defaultValue: 'oUJ1ZW5vcyBk7WFzIQ==',
    inputType: 'textarea',
    inputWidth,
    rows,
    validate: value => !encodedRegex.test(value) && encodedError,
    onInput: onEncodedInput,
};

const charset: DynamicEntry<string, State> = {
    name: 'Charset',
    description: 'The character set used to encode/decode the string.',
    defaultValue: 'latin1',
    inputType: 'select',
    selectOptions: {
        latin1: 'ISO-8859-1',
        utf8: 'UTF-8',
    },
    validate: (_, state) =>
        state.lastInput === 'decoded' &&
        !isInLatin1Range(state.decoded) &&
        state.charset === 'latin1' &&
        'Some characters are not in ISO-8859-1.',
    onChange: onCharsetChange,
};

const lastInput: DynamicEntry<string, State> = {
    name: 'Last input',
    description: 'This field should never be visible to users.',
    defaultValue: 'decoded',
    inputType: 'select',
    selectOptions: {
        decoded: 'Decoded',
        encoded: 'Encoded',
    },
};

interface State {
    decoded: string;
    encoded: string;
    charset: string;
    lastInput: string;
}

const entries: DynamicEntries<State> = {
    decoded,
    encoded,
    charset,
    lastInput,
};

const store = getPersistedStore(entries, 'encoding-base64');
const Input = getInput(store);

/* ------------------------------ User interface ------------------------------ */

export const toolEncodingBase64 = <Input entries={{ decoded, encoded, charset }}/>;
