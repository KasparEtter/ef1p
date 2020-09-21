import { createElement, Fragment } from 'react';

import { CodeBlock } from '../../react/code';
import { Command } from '../../react/command';
import { AllEntries, DynamicEntries, DynamicEntry, getDefaultPersistedState, PersistedState, ProvidedDynamicEntries } from '../../react/entry';
import { RawInput, RawInputProps } from '../../react/input';
import { prompt, RawPrompt, StateWithPrompt } from '../../react/prompt';
import { shareState, shareStore } from '../../react/share';
import { PersistedStore } from '../../react/store';
import { Children } from '../../react/utility';

const webAddress: DynamicEntry<string> = {
    name: 'Web address',
    description: 'The web address you would like to fetch manually from the command line.',
    defaultValue: 'https://explained-from-first-principles.com/internet/',
    inputType: 'text',
    labelWidth: 96,
    inputWidth: 450,
    validate: value =>
        // These checks are redundant to the regular expression on the last line of this property but they provide a more specific error message.
        value === '' && 'The web address may not be empty.' ||
        value.includes(' ') && 'The web address may not contain spaces.' ||
        !value.startsWith('http://') && !value.startsWith('https://') && `The web address has to start with 'http://' or 'https://'.` ||
        !/^[a-z0-9-_\.:\/?&=]+$/i.test(value) && 'Only the Latin alphabet is currently supported.' ||
        !/^(http|https):\/\/([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}(:\d+)?(\/[a-z0-9-_\.:\/?&=]*)?$/i.test(value) && 'The pattern of the web address is invalid.',
};

interface State extends StateWithPrompt {
    webAddress: string;
}

const entries: DynamicEntries<State> = {
    prompt,
    webAddress,
};

function RawHttpCommand({ states, index }: Readonly<PersistedState<State>>): JSX.Element {
    const webAddress = states[index].webAddress;
    const [, protocol, domain, port, path] = /^(http|https):\/\/([a-z0-9-\.]+)(?::(\d+))?(\/.*)?$/i.exec(webAddress)!;
    return <CodeBlock>
        <Prompt>
            {
                protocol === 'http' ?
                <span
                    className="static-output"
                    title="A common command to open a TCP channel to the specified server."
                >telnet</span> :
                <span
                    className="static-output"
                    title="A common command with some options to open a TLS channel to the specified server."
                >openssl s_client -connect</span>
            }
            {' '}
            <span
                className="dynamic-output"
                title="The domain name of the server, which is resolved to an IP address using DNS."
            >{domain}</span>
            {protocol === 'http' ? ' ' : ':'}
            <span
                className="dynamic-output"
                title="The port number of the server process."
            >{port ?? (protocol === 'http' ? '80' : '443')}</span>
        </Prompt>
        <div className="position-relative">
            <Command>
                <span
                    className="static-output"
                    title="The HTTP request method to retrieve a document."
                >GET</span>{' '}
                <span
                    className="dynamic-output"
                    title="The path of the resource which is requested."
                >{path ?? '/'}</span>{' '}
                <span
                    className="static-output"
                    title="The used version of the HTTP protocol."
                >HTTP/1.0</span>
            </Command>
        </div>
        <div className="position-relative">
            <Command>
                <span
                    className="static-output"
                    title="The host header allows the server to serve multiple websites from the same IP address and port number."
                >Host:</span>{' '}
                <span
                    className="dynamic-output"
                    title="The domain name of the web server."
                >{domain}</span>
            </Command>
        </div>
        <br/>
    </CodeBlock>;
}

const store = new PersistedStore<PersistedState<State>, AllEntries<State>>(getDefaultPersistedState(entries), { entries }, 'http');
const Input = shareStore<PersistedState<State>, ProvidedDynamicEntries<State> & RawInputProps<State>, AllEntries<State>>(store)(RawInput);
const Prompt = shareStore<PersistedState<State>, Children, AllEntries<State>>(store)(RawPrompt);
const HttpCommand = shareState<PersistedState<State>>(store)(RawHttpCommand);

export const httpTool = <Fragment>
    <Input entries={{ webAddress }} horizontal />
    <HttpCommand/>
</Fragment>;
