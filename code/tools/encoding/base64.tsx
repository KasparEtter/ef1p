/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Charset, decodeBase64, encodeBase64WithLineLengthLimit, isInLatin1Range } from '../../utility/encoding';

import { DynamicEntries, DynamicSingleSelectEntry, DynamicTextareaEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const inputWidth = 200;
const rows = 3;

const decoded: DynamicTextareaEntry<State> = {
    label: 'Decoded',
    tooltip: 'The Base64-decoded string.',
    defaultValue: '¡Buenos días!',
    inputType: 'textarea',
    inputWidth,
    rows,
    updateOtherInputsOnInput: (input, inputs) => ({ lastInput: 'decoded', encoded: encodeBase64WithLineLengthLimit(input, inputs.charset as Charset) }),
};

const encoded: DynamicTextareaEntry<State> = {
    label: 'Encoded',
    tooltip: 'The Base64-encoded string.',
    defaultValue: 'oUJ1ZW5vcyBk7WFzIQ==',
    inputType: 'textarea',
    inputWidth,
    rows,
    validateIndependently: input => !/^[\sa-zA-Z0-9+/]*(=\s*){0,2}$/.test(input) && 'This is not a valid Base64 string.',
    updateOtherInputsOnInput: (input, inputs) => ({ lastInput: 'encoded', decoded: decodeBase64(input, inputs.charset as Charset) }),
};

const charset: DynamicSingleSelectEntry<State> = {
    label: 'Charset',
    tooltip: 'The character set used to encode/decode the string.',
    defaultValue: 'latin1',
    inputType: 'select',
    selectOptions: {
        latin1: 'ISO-8859-1',
        utf8: 'UTF-8',
    },
    dependencies: ['decoded', 'lastInput'],
    validateDependently: (input, inputs) => inputs.lastInput === 'decoded' && !isInLatin1Range(inputs.decoded) && input === 'latin1' && 'Some characters are not in ISO-8859-1.',
    triggerOtherInputOnInput: inputs => inputs.lastInput === 'decoded' ? 'decoded' : 'encoded',
};

const lastInput: DynamicSingleSelectEntry<State> = {
    label: 'Last input',
    tooltip: 'This field should never be visible to users.',
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

const store = new VersionedStore(entries, 'encoding-base64');
const Input = getInput(store);

/* ------------------------------ Tool ------------------------------ */

export const toolEncodingBase64: Tool = [<Input entries={{ decoded, encoded, charset }}/>, store];
