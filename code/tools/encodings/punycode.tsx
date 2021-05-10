/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import punycode from 'punycode/'; // Refers to Node's deprecated library without the trailing slash.

import { countOccurrences } from '../../utility/functions';

import { DynamicEntry, ErrorType } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, mergeIntoCurrentState, ProvidedDynamicEntries, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';

/* ------------------------------ Entry updates ------------------------------ */

// A very crude approximation of the IDNA2008 rules: https://tools.ietf.org/html/rfc5894#section-3.1.3
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes
// Unicode categories: https://www.regular-expressions.info/unicode.html
// See also https://mathiasbynens.be/notes/es-unicode-property-escapes#word
// and https://github.com/mathiasbynens/regexpu-core for transpiling the property escapes.
const unicodeDomainRegex = /^([\p{Letter}\p{Number}][\p{Letter}\p{Mark}\p{Number}\p{Join_Control}]*(-+[\p{Letter}\p{Number}][\p{Letter}\p{Mark}\p{Number}\p{Join_Control}]*)*(\.[\p{Letter}\p{Number}][\p{Letter}\p{Mark}\p{Number}\p{Join_Control}]*(-+[\p{Letter}\p{Number}][\p{Letter}\p{Mark}\p{Number}\p{Join_Control}]*)*)*\.?)?$/u;

const encodingError = 'This is not a valid domain name.';

function encode(): void {
    const inputs = store.state.inputs;
    if (inputs.domain) {
        if (!unicodeDomainRegex.test(inputs.decoded)) {
            store.state.errors.decoded = encodingError;
        } else {
            const lowercase = inputs.decoded.toLowerCase();
            const normalized = lowercase.normalize('NFKC');
            if (countOccurrences(lowercase, /\./g) !== countOccurrences(normalized, /\./g)) {
                store.state.errors.decoded = 'The normalization of a character includes a dot.';
            } else {
                inputs.encoded = punycode.toASCII(normalized);
                const labels = inputs.encoded.split('.');
                if (labels.some(label => label.length > 63)) {
                    store.state.errors.decoded = 'One of the encoded labels is too long.';
                }
            }
        }
    } else {
        inputs.encoded = punycode.encode(inputs.decoded);
    }
    store.update('input');
}

function onDecodedInput(): void {
    encode();
    store.update('input');
}

const decodingError = 'This is not a valid Punycode encoding.';

function decode(): void {
    try {
        const inputs = store.state.inputs;
        inputs.decoded = inputs.domain ? punycode.toUnicode(inputs.encoded) : punycode.decode(inputs.encoded);
    } catch (error) {
        store.state.errors.encoded = decodingError;
    }
}

function onEncodedInput(): void {
    decode();
    store.update('input');
}

function validateEncoded(): ErrorType {
    try {
        const inputs = store.state.inputs;
        inputs.domain ? punycode.toUnicode(inputs.encoded) : punycode.decode(inputs.encoded);
    } catch (error) {
        return decodingError;
    }
    return false;
}

function onDomainChange(): void {
    encode();
    mergeIntoCurrentState(store);
}

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 245;

const decoded: DynamicEntry<string, State> = {
    name: 'Decoded',
    description: 'The decoded Unicode string.',
    defaultValue: 'Zürich',
    inputType: 'text',
    labelWidth: 68,
    inputWidth,
    validate: (value, { domain }) => domain && !unicodeDomainRegex.test(value) && encodingError,
    onInput: onDecodedInput,
};

const encoded: DynamicEntry<string, State> = {
    name: 'Encoded',
    description: 'The encoded Punycode string.',
    defaultValue: 'Zrich-kva',
    inputType: 'text',
    labelWidth: 66,
    inputWidth,
    validate: validateEncoded,
    onInput: onEncodedInput,
};

const domain: DynamicEntry<boolean, State> = {
    name: 'Domain',
    description: 'Whether to encode/decode the string as a domain name.',
    defaultValue: false,
    inputType: 'switch',
    labelWidth: 60,
    onChange: onDomainChange,
};

interface State {
    decoded: string;
    encoded: string;
    domain: boolean;
}

const entries: DynamicEntries<State> = {
    decoded,
    encoded,
    domain,
};

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'encoding-punycode');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);

/* ------------------------------ User interface ------------------------------ */

export const toolEncodingPunycode = <Input entries={entries}/>;
