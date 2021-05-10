/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import createHash from 'create-hash';
import { Fragment } from 'react';

import { singleQuote } from '../../utility/functions';

import { CodeBlock, DynamicOutput } from '../../react/code';
import { ClickToCopy } from '../../react/copy';
import { DynamicEntry } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { StaticPrompt } from '../../react/prompt';
import { shareState, shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, ProvidedDynamicEntries, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';

/* ------------------------------ Dynamic entries ------------------------------ */

const input: DynamicEntry<string> = {
    name: 'Input',
    description: 'The input that you want to hash.',
    defaultValue: 'Hello',
    inputType: 'text',
    labelWidth: 43,
    inputWidth: 300,
};

const hashFunctions = {
    md5: 'MD5 [deprecated]',
    ripemd160: 'RIPEMD-160',
    sha1: 'SHA-1 [deprecated]',
    sha224: 'SHA-224',
    sha256: 'SHA-256',
    sha384: 'SHA-384',
    sha512: 'SHA-512',
};

const algorithm: DynamicEntry<string> = {
    name: 'Algorithm',
    description: 'The cryptographic hash function that you want to apply to the input.',
    defaultValue: 'sha256',
    inputType: 'select',
    labelWidth: 76,
    selectOptions: hashFunctions,
};

const uppercase: DynamicEntry<boolean> = {
    name: 'Uppercase',
    description: 'Whether to output the hexadecimal characters in uppercase.',
    defaultValue: false,
    inputType: 'switch',
    labelWidth: 80,
};

interface State {
    input: string;
    algorithm: string;
    uppercase: boolean;
}

const entries: DynamicEntries<State> = {
    input,
    algorithm,
    uppercase,
};

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'instruction-hashing');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);

/* ------------------------------ User interface ------------------------------ */

function RawHashOutput(versionedState: VersionedState<State>): JSX.Element {
    const { input, algorithm, uppercase } = versionedState.inputs;
    // https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding ('utf-8' is enforced.)
    const hash = createHash(algorithm as any).update(input).digest('hex');
    return <CodeBlock>
        <StaticPrompt>printf '%s' {singleQuote(input)} | openssl {algorithm}{uppercase && ' | tr [:lower:] [:upper:]'}</StaticPrompt>
        <ClickToCopy>
            <DynamicOutput title={`The ${hashFunctions[algorithm as keyof typeof hashFunctions]} hash of the given input. Click to copy.`}>
                {uppercase ? hash.toUpperCase() : hash}
            </DynamicOutput>
        </ClickToCopy>
    </CodeBlock>;
}

const HashOutput = shareState<VersionedState<State>, {}, AllEntries<State>, VersioningEvent>(store, 'input')(RawHashOutput);

export const toolInstructionHashing = <Fragment>
    <Input entries={entries}/>
    <HashOutput/>
</Fragment>;
