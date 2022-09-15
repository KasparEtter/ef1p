/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { CodeBlock } from '../../react/code';
import { DynamicEntries, DynamicSingleSelectEntry, DynamicTextEntry } from '../../react/entry';
import { getIfCase } from '../../react/if-case';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { StaticPrompt } from '../../react/prompt';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const certificateFile: DynamicTextEntry<State> = {
    label: 'Certificate file',
    tooltip: 'The name of the end-entity or trust-anchor certificate.',
    defaultValue: 'certificate.pem',
    inputType: 'text',
    inputWidth: 120,
};

const selector: DynamicSingleSelectEntry<State> = {
    label: 'Selector',
    tooltip: 'Which part of the certificate is referenced by the TLSA record.',
    defaultValue: 'spki',
    inputType: 'select',
    selectOptions: {
        spki: 'SubjectPublicKeyInfo (SPKI)',
        full: 'Full DER-encoded certificate',
    },
};

const matchingType: DynamicSingleSelectEntry<State> = {
    label: 'Matching type',
    tooltip: 'How the selected content is presented in the certificate association field.',
    defaultValue: 'sha256',
    inputType: 'select',
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

const store = new VersionedStore(entries, 'instruction-tlsa-record');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);
const IfCase = getIfCase(store);

/* ------------------------------ Tool ------------------------------ */

export const toolInstructionTlsaRecord: Tool = [
    <Fragment>
        <Input/>
        <CodeBlock>
            <StaticPrompt>
                openssl x509 -in <OutputEntries entries={{ certificateFile }}/>
                <IfCase entry="selector" value="spki">
                    {' '}-noout -pubkey | openssl pkey -pubin
                </IfCase>
                {' '}-outform DER | openssl <OutputEntries entries={{ matchingType }}/>
            </StaticPrompt>
        </CodeBlock>
    </Fragment>,
    store,
];
