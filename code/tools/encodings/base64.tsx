import { Charset, decodeBase64, encodeBase64WithLineLengthLimit, isInLatin1Range } from '../../utility/encoding';

import { DynamicEntry } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, mergeIntoCurrentState, ProvidedDynamicEntries, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';

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
    labelWidth: 68,
    inputWidth,
    rows,
    onInput: onDecodedInput,
};

const encoded: DynamicEntry<string, State> = {
    name: 'Encoded',
    description: 'The Base64-encoded string.',
    defaultValue: 'oUJ1ZW5vcyBk7WFzIQ==',
    inputType: 'textarea',
    labelWidth: 66,
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
    labelWidth: 61,
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
    labelWidth: 74,
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

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'encoding-base64');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);

/* ------------------------------ User interface ------------------------------ */

export const toolEncodingBase64 = <Input entries={{ decoded, encoded, charset }}/>;
