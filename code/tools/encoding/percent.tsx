/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { decodePercent, encodePercent } from '../../utility/string';

import { DynamicBooleanEntry, DynamicEntries, DynamicTextareaEntry, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const inputWidth = 340;

const decoded: DynamicTextareaEntry<State> = {
    label: 'Decoded',
    tooltip: 'The Percent-decoded word.',
    defaultValue: '¡Buenos días!',
    inputType: 'textarea',
    labelWidth: 68,
    inputWidth,
    rows: 3,
    updateOtherInputsOnInput: (input, inputs) => ({ encoded: encodePercent(input, inputs.form, inputs.strict) }),
};

const encoded: DynamicTextEntry<State> = {
    label: 'Encoded',
    tooltip: 'The Percent-encoded word.',
    defaultValue: '%C2%A1Buenos%20d%C3%ADas!',
    inputType: 'text',
    labelWidth: 68,
    inputWidth,
    validateIndependently: input => !/^[^%]*(%[0-9a-fA-F]{2}[^%]*)*$/.test(input) && 'This is not a valid Percent-encoded string.',
    updateOtherInputsOnInput: input => ({ decoded: decodePercent(input) }),
};

const form: DynamicBooleanEntry<State> = {
    label: 'Form',
    tooltip: 'Whether to encode the space with a plus instead of %20. This is used when HTML forms are submitted.',
    defaultValue: false,
    inputType: 'switch',
    labelWidth: 43,
    triggerOtherInputOnInput: 'decoded',
};

const strict: DynamicBooleanEntry<State> = {
    label: 'Strict',
    tooltip: `Whether to encode also !, ', (, ), and * as required by RFC 3986.`,
    defaultValue: false,
    inputType: 'switch',
    labelWidth: 43,
    triggerOtherInputOnInput: 'decoded',
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

const store = new VersionedStore(entries, 'encoding-percent');
const Input = getInput(store);

/* ------------------------------ Tool ------------------------------ */

export const toolEncodingPercent: Tool = [<Input inColumns individualLabelWidth/>, store];
