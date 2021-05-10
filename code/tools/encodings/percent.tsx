/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { decodePercent, encodePercent } from '../../utility/encoding';

import { DynamicEntry, ErrorType } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, mergeIntoCurrentState, ProvidedDynamicEntries, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';

/* ------------------------------ Entry updates ------------------------------ */

function encode(): void {
    const inputs = store.state.inputs;
    inputs.encoded = encodePercent(inputs.decoded, inputs.form, inputs.strict);
}

function onDecodedInput(): void {
    encode();
    store.update('input');
}

const encodedRegex = /^[^%]*(%[0-9a-fA-F]{2}[^%]*)*$/;
const encodedError = 'This is not a valid percent-encoded string.';

function decode(): void {
    if (encodedRegex.test(store.state.inputs.encoded)) {
        try {
            const inputs = store.state.inputs;
            inputs.decoded = decodePercent(inputs.encoded);
        } catch (error) {
            store.state.errors.encoded = encodedError;
        }
    } else {
        store.state.errors.encoded = encodedError;
    }
}

function onEncodedInput(): void {
    decode();
    store.update('input');
}

function validateEncoded(value: string): ErrorType {
    try {
        decodePercent(value);
    } catch (error) {
        return encodedError;
    }
    return false;
}

function onOptionChange(): void {
    encode();
    mergeIntoCurrentState(store);
}

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 340;

const decoded: DynamicEntry<string, State> = {
    name: 'Decoded',
    description: 'The Percent-decoded word.',
    defaultValue: '¡Buenos días!',
    inputType: 'textarea',
    labelWidth: 68,
    inputWidth,
    rows: 3,
    onInput: onDecodedInput,
};

const encoded: DynamicEntry<string, State> = {
    name: 'Encoded',
    description: 'The Percent-encoded word.',
    defaultValue: '%C2%A1Buenos%20d%C3%ADas!',
    inputType: 'text',
    labelWidth: 68,
    inputWidth,
    validate: value => !encodedRegex.test(value) && encodedError || validateEncoded(value),
    onInput: onEncodedInput,
};

const form: DynamicEntry<boolean, State> = {
    name: 'Form',
    description: 'Whether to encode the space with a plus instead of %20. This is used when HTML forms are submitted.',
    defaultValue: false,
    inputType: 'switch',
    labelWidth: 43,
    onChange: onOptionChange,
};

const strict: DynamicEntry<boolean, State> = {
    name: 'Strict',
    description: `Whether to encode also !, ', (, ), and * as required by RFC 3986.`,
    defaultValue: false,
    inputType: 'switch',
    labelWidth: 43,
    onChange: onOptionChange,
};

interface State {
    decoded: string;
    encoded: string;
    form: boolean;
    strict: boolean;
}

const entries: DynamicEntries<State> = {
    decoded,
    encoded,
    form,
    strict,
};

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'encoding-percent');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);

/* ------------------------------ User interface ------------------------------ */

export const toolEncodingPercent = <Input entries={entries} newColumnAt={2} individualLabelWidth/>;
