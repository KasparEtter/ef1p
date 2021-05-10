/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { decodeExtendedParameter, encodeExtendedParameter } from '../../utility/encoding';

import { DynamicEntry } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, ProvidedDynamicEntries, setState, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';

/* ------------------------------ Entry updates ------------------------------ */

function encode(): void {
    const inputs = store.state.inputs;
    inputs.encoded = encodeExtendedParameter(inputs.decoded);
    store.update('input');
}

function decode(): void {
    const inputs = store.state.inputs;
    inputs.decoded = decodeExtendedParameter(inputs.encoded);
    store.update('input');
}

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 300;
const rows = 3;

const decoded: DynamicEntry<string, State> = {
    name: 'Decoded',
    description: 'The parameter decoded according to RFC 2231.',
    defaultValue: 'filename="¡Buenos días!.txt"',
    inputType: 'textarea',
    labelWidth: 68,
    inputWidth,
    rows,
    onInput: encode,
};

const encoded: DynamicEntry<string, State> = {
    name: 'Encoded',
    description: 'The parameter encoded according to RFC 2231.',
    defaultValue: "filename*=iso-8859-1'es'%A1Buenos%20d%EDas!.txt",
    inputType: 'textarea',
    labelWidth: 66,
    inputWidth,
    rows,
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

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'encoding-extended-parameter');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);

/* ------------------------------ User interface ------------------------------ */

export const toolEncodingExtendedParameter = <Input entries={entries}/>;

/* ------------------------------ Element bindings ------------------------------ */

function clickHandler(this: HTMLElement): void {
    const { decoded, encoded } = this.dataset;
    if (decoded !== undefined) {
        setState(store, { decoded: decoded.replace(/\\n/g, '\n') });
        encode();
    } else if (encoded !== undefined) {
        setState(store, { encoded: encoded.replace(/\\n/g, '\n') });
        decode();
    }
}

export function bindExtendedParameters() {
    for (const element of document.getElementsByClassName('bind-extended-parameter') as HTMLCollectionOf<HTMLElement>) {
        const { decoded, encoded } = element.dataset;
        if ((decoded === undefined) === (encoded === undefined)) {
            console.error('The data attributes of the following element are invalid:', element);
        } else {
            element.addEventListener('click', clickHandler);
        }
    }
}
