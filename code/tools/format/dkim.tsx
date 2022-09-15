/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { Argument } from '../../react/argument';
import { CodeBlock } from '../../react/code';
import { ClickToCopy } from '../../react/copy';
import { DynamicBooleanEntry, DynamicEntries, DynamicMultipleSelectEntry, DynamicSingleSelectEntry, DynamicTextareaEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { getDefaultState, VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const minimalOutput: DynamicBooleanEntry<DkimState> = {
    label: 'Minimal output',
    tooltip: 'Whether to only output the parameters which are different from their default value.',
    defaultValue: true,
    inputType: 'switch',
};

const keyType: DynamicSingleSelectEntry<DkimState> & Argument<string, DkimState> = {
    label: 'Key type',
    longForm: 'k',
    tooltip: 'The name of the used signing algorithm.',
    defaultValue: 'rsa',
    inputType: 'select',
    selectOptions: {
        rsa: 'RSA',
        ed25519: 'ED25519',
    },
    skip: (state, value) => state.minimalOutput && value === 'rsa',
};

const publicKey: DynamicTextareaEntry<DkimState> & Argument<string, DkimState> = {
    label: 'Public key',
    longForm: 'p',
    tooltip: 'The public key encoded with Base64. An empty value means that this public key has been revoked.',
    defaultValue: '',
    inputType: 'textarea',
    inputWidth: 280,
    rows: 3,
    transform: value => value.replace(/\s*/g, ''),
    skip: () => false, // Ensures that the public key is displayed even when its value is empty.
    validateIndependently: input => !/^[\sa-zA-Z0-9+/]*(=\s*){0,2}$/.test(input) && 'The public key has to be Base64 encoded.',
};

const hashAlgorithms: DynamicSingleSelectEntry<DkimState> & Argument<string, DkimState> = {
    label: 'Hash algorithms',
    longForm: 'h',
    tooltip: 'A colon-separated list of acceptable hash algorithms. By not specifying this tag, all algorithms are allowed.',
    defaultValue: 'all',
    inputType: 'select',
    selectOptions: {
        all: 'All',
        sha256: 'SHA-256',
    },
    skip: (_, value) => value === 'all',
};

const serviceTypes: DynamicSingleSelectEntry<DkimState> & Argument<string, DkimState> = {
    label: 'Service types',
    longForm: 's',
    tooltip: 'A colon-separated list of the services for which this key is used.',
    defaultValue: '*',
    inputType: 'select',
    selectOptions: {
        '*': 'All',
        'email': 'Email',
        'tlsrpt': 'TLSRPT',
    },
    skip: (state, value) => state.minimalOutput && value === '*',
};

const flags: DynamicMultipleSelectEntry<DkimState> & Argument<string[], DkimState> = {
    label: 'Flags',
    longForm: 't',
    tooltip: 'A colon-separated list of flags.',
    defaultValue: [],
    valueSeparator: ':',
    inputType: 'multiple',
    selectOptions: {
        'y': 'Just testing, ignore signatures',
        's': 'No subdomain in user identifier',
    },
    skip: (_, value) => value.length === 0,
};

export interface DkimState {
    minimalOutput: boolean;
    keyType: string;
    publicKey: string;
    hashAlgorithms: string;
    serviceTypes: string;
    flags: string[];
}

const entries: DynamicEntries<DkimState> = {
    minimalOutput,
    keyType,
    publicKey,
    hashAlgorithms,
    serviceTypes,
    flags,
};

const store = new VersionedStore(entries, 'format-dkim');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);

export function getDefaultDkimState(): DkimState {
    return getDefaultState(entries);
}

export function setDkimState(partialNewState: Readonly<Partial<DkimState>>): void {
    store.setNewStateDirectly(partialNewState);
}

/* ------------------------------ Output ------------------------------ */

const version: Argument<string, DkimState> = {
    label: 'Version',
    longForm: 'v',
    tooltip: `The version of the DKIM standard.`,
    defaultValue: 'DKIM1',
};

/* ------------------------------ Tool ------------------------------ */

export const toolFormatDkim: Tool = [
    <Fragment>
        <Input inColumns/>
        <CodeBlock wrapped>
            <ClickToCopy>
                <OutputEntries entries={{
                        version,
                        keyType,
                        hashAlgorithms,
                        serviceTypes,
                        flags,
                        publicKey,
                    }}
                    outputSeparator={'; '}
                    argumentSeparator={'='}
                />
            </ClickToCopy>
        </CodeBlock>
    </Fragment>,
    store,
];
