/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { CodeBlock } from '../../react/code';
import { DynamicEntry } from '../../react/entry';
import { IfCaseProps, RawIfCase } from '../../react/if-case';
import { InputProps, RawInput } from '../../react/input';
import { OutputEntriesProps, RawOutputEntries } from '../../react/output-entries';
import { StaticPrompt } from '../../react/prompt';
import { shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, ProvidedDynamicEntries, ProvidedEntries, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';
import { Children } from '../../react/utility';

/* ------------------------------ Dynamic entries ------------------------------ */

const certificateFile: DynamicEntry<string> = {
    name: 'Certificate file',
    description: 'The name of the end-entity or trust-anchor certificate.',
    defaultValue: 'certificate.pem',
    inputType: 'text',
    labelWidth: 105,
    inputWidth: 140,
};

const selector: DynamicEntry<string, State> = {
    name: 'Selector',
    description: 'Which part of the certificate is referenced by the TLSA record.',
    defaultValue: 'spki',
    inputType: 'select',
    labelWidth: 63,
    selectOptions: {
        spki: 'SubjectPublicKeyInfo (SPKI)',
        full: 'Full DER-encoded certificate',
    },
};

const matchingType: DynamicEntry<string, State> = {
    name: 'Matching type',
    description: 'How the selected content is presented in the certificate association field.',
    defaultValue: 'sha256',
    inputType: 'select',
    labelWidth: 106,
    selectOptions: {
        sha256: 'SHA-256',
        sha512: 'SHA-512',
    },
};

interface State {
    certificateFile: string;
    selector: string;
    matchingType: string;
}

const entries: DynamicEntries<State> = {
    certificateFile,
    selector,
    matchingType,
};

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'instruction-tlsa-record');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);
const OutputEntries = shareStore<VersionedState<State>, ProvidedEntries & OutputEntriesProps, AllEntries<State>, VersioningEvent>(store, 'state')(RawOutputEntries);
const IfCase = shareStore<VersionedState<State>, IfCaseProps<State> & Children, AllEntries<State>, VersioningEvent>(store, 'state')(RawIfCase);

/* ------------------------------ User interface ------------------------------ */

export const toolInstructionTlsaRecord = <Fragment>
    <Input entries={entries}/>
    <CodeBlock>
        <StaticPrompt>
            openssl x509 -in <OutputEntries entries={{ certificateFile }}/>
            <IfCase entry="selector" value="spki">
                {' '}-noout -pubkey | openssl pkey -pubin
            </IfCase>
            {' '}-outform DER | openssl <OutputEntries entries={{ matchingType }}/>
        </StaticPrompt>
    </CodeBlock>
</Fragment>;
