/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import createHash from 'create-hash';
import { Fragment } from 'react';

import { singleQuote } from '../../utility/string';

import { CodeBlock, DynamicOutput } from '../../react/code';
import { ClickToCopy } from '../../react/copy';
import { DynamicBooleanEntry, DynamicEntries, DynamicSingleSelectEntry, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { StaticPrompt } from '../../react/prompt';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const input: DynamicTextEntry = {
    label: 'Input',
    tooltip: 'The input that you want to hash.',
    defaultValue: 'Hello',
    inputType: 'text',
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

const algorithm: DynamicSingleSelectEntry = {
    label: 'Algorithm',
    tooltip: 'The cryptographic hash function that you want to apply to the input.',
    defaultValue: 'sha256',
    inputType: 'select',
    selectOptions: hashFunctions,
};

const uppercase: DynamicBooleanEntry = {
    label: 'Uppercase',
    tooltip: 'Whether to output the hexadecimal characters in uppercase.',
    defaultValue: false,
    inputType: 'switch',
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

const store = new VersionedStore(entries, 'instruction-hashing');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawHashOutput({ input, algorithm, uppercase }: State): JSX.Element {
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

const HashOutput = store.injectInputs(RawHashOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolInstructionHashing: Tool = [
    <Fragment>
        <Input/>
        <HashOutput/>
    </Fragment>,
    store,
];
