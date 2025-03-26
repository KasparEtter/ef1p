/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { decodePunycode, encodePunycode } from '../../utility/domain';

import { DynamicBooleanEntry, DynamicEntries, DynamicTextEntry, validateByTrial } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Utility ------------------------------ */

function encode(input: string, inputs: Readonly<State>): Partial<State> {
    return { encoded: encodePunycode(input, inputs.domain) };
}

function decode(input: string, inputs: Readonly<State>): Partial<State> {
    return { decoded: decodePunycode(input, inputs.domain) };
}

/* ------------------------------ Input ------------------------------ */

const inputWidth = 235;

const decoded: DynamicTextEntry<State> = {
    label: 'Decoded',
    tooltip: 'The decoded Unicode string.',
    defaultValue: 'Zürich',
    inputType: 'text',
    inputWidth,
    validateDependently: validateByTrial(encode),
    updateOtherInputsOnInput: encode,
};

const encoded: DynamicTextEntry<State> = {
    label: 'Encoded',
    tooltip: 'The encoded Punycode string.',
    defaultValue: 'Zrich-kva',
    inputType: 'text',
    inputWidth,
    validateDependently: validateByTrial(decode),
    updateOtherInputsOnInput: decode,
};

const domain: DynamicBooleanEntry<State> = {
    label: 'Domain',
    tooltip: 'Whether to encode/decode the string as a domain name.',
    defaultValue: false,
    inputType: 'switch',
    triggerOtherInputOnInput: 'decoded',
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

const store = new VersionedStore(entries, 'encoding-punycode');
const Input = getInput(store);

/* ------------------------------ Tool ------------------------------ */

export const toolEncodingPunycode: Tool = [<Input/>, store];
