/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { CodeBlock } from '../../react/code';
import { DynamicEntry } from '../../react/entry';
import { getIfCase } from '../../react/if-case';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { StaticPrompt } from '../../react/prompt';
import { DynamicEntries, getPersistedStore } from '../../react/state';

/* ------------------------------ Dynamic entries ------------------------------ */

const certificateFile: DynamicEntry<string> = {
    name: 'Certificate file',
    description: 'The name of the end-entity or trust-anchor certificate.',
    defaultValue: 'certificate.pem',
    inputType: 'text',
    labelWidth: 105,
    inputWidth: 135,
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

const store = getPersistedStore(entries, 'instruction-tlsa-record');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);
const IfCase = getIfCase(store);

/* ------------------------------ User interface ------------------------------ */

export const toolInstructionTlsaRecord = <Fragment>
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
</Fragment>;
