/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { Argument, DynamicArgument } from '../../react/argument';
import { CodeBlock } from '../../react/code';
import { ClickToCopy } from '../../react/copy';
import { DynamicEntry } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { OutputEntriesProps, RawOutputEntries } from '../../react/output-entries';
import { shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultState, getDefaultVersionedState, ProvidedDynamicEntries, ProvidedEntries, setState, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';

/* ------------------------------ Dynamic entries ------------------------------ */

const minimalOutput: DynamicEntry<boolean, DkimState> = {
    name: 'Minimal output',
    description: 'Whether to only output the parameters which are different from their default value.',
    defaultValue: true,
    inputType: 'switch',
    labelWidth: 113,
};

const keyType: DynamicArgument<string, DkimState> = {
    name: 'Key type',
    longForm: 'k',
    description: 'The name of the used signing algorithm.',
    defaultValue: 'rsa',
    inputType: 'select',
    labelWidth: 66,
    selectOptions: {
        rsa: 'RSA',
        ed25519: 'ED25519',
    },
    skip: (state, value) => state.minimalOutput && value === 'rsa',
};

const publicKey: DynamicArgument<string, DkimState> = {
    name: 'Public key',
    longForm: 'p',
    description: 'The public key encoded with Base64. An empty value means that this public key has been revoked.',
    defaultValue: '',
    inputType: 'textarea',
    labelWidth: 76,
    inputWidth: 280,
    rows: 3,
    skip: () => false,
    validate: value => !/^[\sa-zA-Z0-9+/]*(=\s*){0,2}$/.test(value) && 'The public key has to be Base64 encoded.',
    transform: value => value.replace(/\s*/g, ''),
};

const hashAlgorithms: DynamicArgument<string, DkimState> = {
    name: 'Hash algorithms',
    longForm: 'h',
    description: 'A colon-separated list of acceptable hash algorithms. By not specifying this tag, all algorithms are allowed.',
    defaultValue: 'all',
    inputType: 'select',
    labelWidth: 119,
    selectOptions: {
        all: 'All',
        sha256: 'SHA-256',
    },
    skip: (_, value) => value === 'all',
};

const serviceTypes: DynamicArgument<string, DkimState> = {
    name: 'Service types',
    longForm: 's',
    description: 'A colon-separated list of the services for which this key is used.',
    defaultValue: '*',
    inputType: 'select',
    labelWidth: 98,
    selectOptions: {
        '*': 'All',
        'email': 'Email',
        'tlsrpt': 'TLSRPT',
    },
    skip: (state, value) => state.minimalOutput && value === '*',
};

const flags: DynamicArgument<string[], DkimState> = {
    name: 'Flags',
    longForm: 't',
    description: 'A colon-separated list of flags.',
    defaultValue: [],
    valueSeparator: ':',
    inputType: 'multiple',
    labelWidth: 41,
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

const store = new PersistedStore<VersionedState<DkimState>, AllEntries<DkimState>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'format-dkim');
const Input = shareStore<VersionedState<DkimState>, ProvidedDynamicEntries<DkimState> & InputProps<DkimState>, AllEntries<DkimState>, VersioningEvent>(store, 'input')(RawInput);
const OutputEntries = shareStore<VersionedState<DkimState>, ProvidedEntries & OutputEntriesProps, AllEntries<DkimState>, VersioningEvent>(store, 'state')(RawOutputEntries);

export function getDefaultDkimState(): DkimState {
    return getDefaultState(entries);
}

export function setDkimState(partialNewState: Partial<DkimState>): void {
    setState(store, partialNewState);
}

/* ------------------------------ Static entries ------------------------------ */

const version: Argument<string, DkimState> = {
    name: 'Version',
    longForm: 'v',
    description: `The version of the DKIM standard.`,
    defaultValue: 'DKIM1',
};

/* ------------------------------ User interface ------------------------------ */

export const toolFormatDkim = <Fragment>
    <Input entries={entries} newColumnAt={3}/>
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
</Fragment>;
