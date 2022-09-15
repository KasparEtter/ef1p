/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { decodeExtendedParameter, encodeExtendedParameter } from '../../utility/encoding';

import { DynamicEntries, DynamicTextareaEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const inputWidth = 290;
const rows = 3;

const decoded: DynamicTextareaEntry<State> = {
    label: 'Decoded',
    tooltip: 'The parameter decoded according to RFC 2231.',
    defaultValue: 'filename="¡Buenos días!.txt"',
    inputType: 'textarea',
    inputWidth,
    rows,
    updateOtherInputsOnInput: input => ({ encoded: encodeExtendedParameter(input) }),
};

const encoded: DynamicTextareaEntry<State> = {
    label: 'Encoded',
    tooltip: 'The parameter encoded according to RFC 2231.',
    defaultValue: "filename*=iso-8859-1'es'%A1Buenos%20d%EDas!.txt",
    inputType: 'textarea',
    inputWidth,
    rows,
    updateOtherInputsOnInput: input => ({ decoded: decodeExtendedParameter(input) }),
};

interface State {
    decoded: string;
    encoded: string;
}

const entries: DynamicEntries<State> = {
    decoded,
    encoded,
};

const store = new VersionedStore(entries, 'encoding-extended-parameter');
const Input = getInput(store);

/* ------------------------------ Tool ------------------------------ */

export const toolEncodingExtendedParameter: Tool = [<Input/>, store];
