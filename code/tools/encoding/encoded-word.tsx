/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { decodeEncodedWord, encodeEncodedWordIfNecessary } from '../../utility/encoding';

import { DynamicEntries, DynamicTextareaEntry, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const inputWidth = 300;

const decoded: DynamicTextEntry<State> = {
    label: 'Decoded',
    tooltip: 'The decoded word.',
    defaultValue: '¡Buenos días!',
    inputType: 'text',
    inputWidth,
    updateOtherInputsOnInput: input => ({ encoded: encodeEncodedWordIfNecessary(input) }),
};

const encoded: DynamicTextareaEntry<State> = {
    label: 'Encoded',
    tooltip: 'The encoded word.',
    defaultValue: '=?ISO-8859-1?Q?=A1Buenos_d=EDas!?=',
    inputType: 'textarea',
    inputWidth,
    rows: 2,
    updateOtherInputsOnInput: input => ({ decoded: decodeEncodedWord(input) }),
};

interface State {
    decoded: string;
    encoded: string;
}

const entries: DynamicEntries<State> = {
    decoded,
    encoded,
};

const store = new VersionedStore(entries, 'encoding-encoded-word');
const Input = getInput(store);

/* ------------------------------ Tool ------------------------------ */

export const toolEncodingEncodedWord: Tool = [<Input/>, store];
