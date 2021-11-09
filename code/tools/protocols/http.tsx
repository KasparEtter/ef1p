/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { CodeBlock, DynamicOutput, StaticOutput } from '../../react/code';
import { ClickToCopy } from '../../react/copy';
import { DynamicEntry } from '../../react/entry';
import { getInput } from '../../react/input';
import { StaticPrompt } from '../../react/prompt';
import { DynamicEntries, getPersistedStore, shareVersionedState } from '../../react/state';
import { Tool } from '../../react/utility';

/* ------------------------------ Dynamic entries ------------------------------ */

const webAddress: DynamicEntry<string> = {
    name: 'Web address',
    description: 'The web address you would like to fetch manually from the command line.',
    defaultValue: 'https://explained-from-first-principles.com/internet/',
    inputType: 'text',
    inputWidth: 450,
    validate: value =>
        // These checks are redundant to the regular expression on the last line of this entry but they provide a more specific error message.
        value === '' && 'The web address may not be empty.' ||
        value.includes(' ') && 'The web address may not contain spaces.' ||
        !value.startsWith('http://') && !value.startsWith('https://') && `The web address has to start with 'http://' or 'https://'.` ||
        !/^[-a-z0-9_.:/?&=!'()*%]+$/i.test(value) && 'Only the Latin alphabet is currently supported.' ||
        !/^(http|https):\/\/([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*[a-z][-a-z0-9]{0,61}[a-z0-9](:\d+)?(\/[a-z0-9-_.:/?&=!'()*%]*)?$/i.test(value) && 'The pattern of the web address is invalid.',
};

interface State {
    webAddress: string;
}

const entries: DynamicEntries<State> = {
    webAddress,
};

const store = getPersistedStore(entries, 'protocol-http');
const Input = getInput(store);

/* ------------------------------ User interface ------------------------------ */

function RawHttpCommand({ webAddress }: State): JSX.Element {
    const [, protocol, domain, port, path] = /^(http|https):\/\/([a-z0-9-\.]+)(?::(\d+))?(\/.*)?$/i.exec(webAddress)!;
    return <CodeBlock>
        <StaticPrompt>
            {
                protocol === 'http' ?
                <StaticOutput title="A common command to open a TCP channel to the specified server.">
                    telnet
                </StaticOutput> :
                <StaticOutput title="A common command with some options to open a TLS channel to the specified server.">
                    openssl s_client -quiet -crlf -connect
                </StaticOutput>
            }
            {' '}
            <DynamicOutput title="The domain name of the server, which is resolved to an IP address using DNS.">
                {domain}
            </DynamicOutput>
            {protocol === 'http' ? ' ' : ':'}
            <DynamicOutput title="The port number of the server process.">
                {port ?? (protocol === 'http' ? '80' : '443')}
            </DynamicOutput>
        </StaticPrompt>
        <div>
            <ClickToCopy>
                <StaticOutput title="The HTTP request method to retrieve a document.">
                    GET
                </StaticOutput>{' '}
                <DynamicOutput title="The path of the resource which is requested.">
                    {path ?? '/'}
                </DynamicOutput>{' '}
                <StaticOutput title="The used version of the HTTP protocol.">
                    HTTP/1.0
                </StaticOutput>
                {'\n'}
                <StaticOutput title="The host header allows the server to serve multiple websites from the same IP address and port number.">
                    Host:
                </StaticOutput>{' '}
                <DynamicOutput title="The domain name of the web server.">
                    {domain}
                </DynamicOutput>
                {'\n\n'}
            </ClickToCopy>
        </div>
    </CodeBlock>;
}

const HttpCommand = shareVersionedState(store)(RawHttpCommand);

export const toolProtocolHttp: Tool = [
    <Fragment>
        <Input/>
        <HttpCommand/>
    </Fragment>,
    store,
];
