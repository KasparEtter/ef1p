/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { encodeDomain, unicodeDomainRegex } from '../../utility/domain';
import { toApopEncoding } from '../../utility/encoding';
import { Dictionary, reverseLookup } from '../../utility/record';

import { CodeBlock, SystemReply, UserCommand } from '../../react/code';
import { DynamicBooleanEntry, DynamicEntries, DynamicNumberEntry, DynamicPasswordEntry, DynamicSingleSelectEntry, DynamicTextEntry, Entry, validateByTrial } from '../../react/entry';
import { getIfCase } from '../../react/if-case';
import { getIfEntries } from '../../react/if-entries';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { StaticPrompt } from '../../react/prompt';
import { VersionedStore } from '../../react/versioned-store';

import { findConfigurationFile, SocketType } from '../../apis/email-configuration';

import { connect, crlf, emailAddressRegex, encodeAddress, encodeIdentifier, getDomain, getUsername, identifierRegex, implementation, maxPortNumber, minPortNumber, openssl, quiet, validateDomain } from './esmtp';

/* ------------------------------ Entry updates ------------------------------ */

const socketTypeLookup: Dictionary<SocketType> = {
    'implicit': 'SSL',
    'explicit': 'STARTTLS',
};

async function updateServer(_: unknown, { security, address }: State): Promise<Partial<State>> {
    const domain = getDomain(address);
    if (/^example\.(org|com|net)$/i.test(domain)) {
        return { server: 'pop3.' + domain };
    } else {
        const configuration = await findConfigurationFile(encodeDomain(domain), [], true);
        const pop3Servers = (configuration?.incomingServers ?? []).filter(server => server.type === 'pop3');
        if (pop3Servers.length > 0) {
            const desiredServer = pop3Servers.filter(server => server.socket === socketTypeLookup[security]);
            const server = desiredServer.length > 0 ? desiredServer[0] : pop3Servers[0];
            const newSecurity = reverseLookup(socketTypeLookup, server.socket) ?? 'implicit';
            return {
                security: newSecurity,
                server: server.host,
                port: parseInt(server.port, 10),
                username: server.username === '%EMAILLOCALPART%' ? 'local' : 'full',
                credential: server.authentication.includes('password-encrypted') ? 'hashed' : 'plain',
            };
        } else {
            let server = prompt(`Could not find the POP3 server of '${domain}'. Please enter it yourself:`);
            while (server !== null && !unicodeDomainRegex.test(server)) {
                server = prompt(`Please enter a valid domain name in the preferred name syntax or click on 'Cancel':`, server);
            }
            return { server: server ?? 'server-not-found.' + domain };
        }
    }
}

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 240;

const address: DynamicTextEntry<State> = {
    label: 'Address',
    tooltip: 'The address of your mailbox.',
    defaultValue: 'alice@example.org',
    inputType: 'text',
    inputWidth,
    validateIndependently: input => !emailAddressRegex.test(input) && 'Please enter a single email address.',
    validateDependently: validateByTrial(encodeAddress),
    transform: encodeAddress,
    updateOtherValuesOnChange: updateServer,
};

const password: DynamicPasswordEntry<State> = {
    label: 'Password',
    tooltip: 'The password of your account. I recommend you to set up a test account for this.',
    defaultValue: '',
    inputType: 'password',
    inputWidth,
    placeholder: 'Your password',
};

const security: DynamicSingleSelectEntry<State> = {
    label: 'Security',
    tooltip: 'Select which variant of TLS you want to use.',
    defaultValue: 'implicit',
    inputType: 'select',
    selectOptions: {
        implicit: 'Implicit TLS',
        explicit: 'Explicit TLS',
    },
    updateOtherValuesOnChange: updateServer,
};

const server: DynamicTextEntry<State> = {
    label: 'Server',
    tooltip: 'The server to connect to. The server is determined automatically if possible, but you can also set it manually.',
    defaultValue: 'pop3.example.org',
    inputType: 'text',
    inputWidth,
    validateIndependently: validateDomain,
    validateDependently: validateByTrial(encodeDomain),
    transform: encodeDomain,
};

const port: DynamicNumberEntry<State> = {
    label: 'Port',
    tooltip: 'The port number of the server. The port number is determined automatically, but you can also set the value manually.',
    defaultValue: 995,
    inputType: 'number',
    inputWidth: inputWidth / 2,
    minValue: minPortNumber,
    maxValue: maxPortNumber,
    // suggestedValues: [110, 995],
    dependencies: 'security',
    derive: ({ security }) => security === 'implicit' ? 995 : 110,
};

const username: DynamicSingleSelectEntry<State> = {
    label: 'Username',
    tooltip: 'Select how to determine the username for authentication.',
    defaultValue: 'full',
    inputType: 'select',
    selectOptions: {
        full: 'Full address',
        local: 'Local part',
    },
};

const credential: DynamicSingleSelectEntry<State> = {
    label: 'Credential',
    tooltip: 'Select how to authenticate towards the server.',
    defaultValue: 'plain',
    inputType: 'select',
    selectOptions: {
        plain: 'Plain password (PLAIN)',
        hashed: 'Hashed password (APOP)',
    },
};

const challenge: DynamicTextEntry<State> = {
    label: 'Challenge',
    tooltip: 'The challenge received from the server when using the hashed password as the credential.',
    defaultValue: '',
    inputType: 'text',
    inputWidth,
    skip: state => state.credential !== 'hashed',
    placeholder: ({ address }) => `<unique@${encodeDomain(getDomain(address))}>`,
    disable: ({ credential }) => credential !== 'hashed',
    dependencies: 'credential',
    validateIndependently: input => input !== '' && !identifierRegex.test(input) && 'The challenge looks like an email address in angle brackets.',
    validateDependently: (input, inputs) => inputs.credential === 'hashed' && input === '' && 'Copy the challenge from the server to this field.'
        && validateByTrial(encodeIdentifier)(input, inputs),
    transform: encodeIdentifier,
};

const deletion: DynamicBooleanEntry<State> = {
    label: 'Delete',
    tooltip: 'Whether to delete the retrieved message on the server.',
    defaultValue: false,
    inputType: 'checkbox',
};

interface State {
    address: string;
    password: string;
    security: string;
    server: string;
    port: number;
    username: string;
    credential: string;
    challenge: string;
    deletion: boolean;
}

const entries: DynamicEntries<State> = {
    address,
    password,
    security,
    server,
    port,
    username,
    credential,
    challenge,
    deletion,
};

const store = new VersionedStore(entries, 'protocol-pop3');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);
const IfCase = getIfCase(store);
const IfEntries = getIfEntries(store);

/* ------------------------------ Command entries ------------------------------ */

const starttls: Entry<string, State> = {
    label: 'Option',
    tooltip: 'Send the POP3-specific command sequence to start TLS for the rest of the communication.',
    defaultValue: '-starttls pop3',
    skip: state => state.security !== 'explicit',
};

const USER: Entry<string> = {
    label: 'Command',
    tooltip: 'The command to indicate the user whose messages you would like to retrieve.',
    defaultValue: 'USER',
};

const PASS: Entry<string> = {
    label: 'Command',
    tooltip: 'The command to provide the password of the user for authentication.',
    defaultValue: 'PASS',
};

const APOP: Entry<string> = {
    label: 'Command',
    tooltip: 'The command to provide the username and the response to the challenge.',
    defaultValue: 'APOP',
};

const LIST: Entry<string> = {
    label: 'Command',
    tooltip: `The command to list all messages in the user's mailbox.`,
    defaultValue: 'LIST',
};

const RETR: Entry<string> = {
    label: 'Command',
    tooltip: 'The command to retrieve the message with the given number.',
    defaultValue: 'RETR',
};

const DELE: Entry<string> = {
    label: 'Command',
    tooltip: 'The command to delete the message with the given number.',
    defaultValue: 'DELE',
};

const QUIT: Entry<string> = {
    label: 'Command',
    tooltip: 'The command to commit the deletions and let the server close the TLS connection.',
    defaultValue: 'QUIT',
};

/* ------------------------------ Response entries ------------------------------ */

const OK: Entry<string> = {
    label: 'Status indicator',
    tooltip: 'Everything went fine.',
    defaultValue: '+OK',
};

const ready: Entry<string> = {
    label: 'Description',
    tooltip: 'An optional text for human users.',
    defaultValue: 'ready.',
};

const loggedIn: Entry<string> = {
    label: 'Description',
    tooltip: 'An optional text for human users.',
    defaultValue: 'Logged in.',
};

const loggingOut: Entry<string, State> = {
    label: 'Description',
    tooltip: 'An optional text for human users.',
    defaultValue: 'Logging out.',
    transform: (_, state) => 'Logging out' + (state.deletion ? ', messages deleted.' : '.'),
};

const messages: Entry<string> = {
    label: 'Amount',
    tooltip: 'The number of messages in the mailbox.',
    defaultValue: '1 messages:',
};

const messageNumber: Entry<string> = {
    label: 'Message number',
    tooltip: 'The message number, which is only valid for the duration of the session.',
    defaultValue: '1',
};

const messageSize: Entry<string> = {
    label: 'Message size',
    tooltip: 'The size of the message in bytes.',
    defaultValue: '623',
};

const messageFollows: Entry<string> = {
    label: 'Description',
    tooltip: 'An optional text for human users.',
    defaultValue: 'Message follows:',
};

const messagePlaceholder: Entry<string> = {
    label: 'Message placeholder',
    tooltip: 'The header and the body of the retrieved message.',
    defaultValue: '{HeaderAndBody}',
};

const messageDeletion: Entry<string> = {
    label: 'Description',
    tooltip: 'An optional text for human users.',
    defaultValue: 'Marked to be deleted.',
};

const period: Entry<string> = {
    label: 'Termination',
    tooltip: 'A period on a line of its own indicates the end of the response.',
    defaultValue: '.',
};

/* ------------------------------ Authentication entries ------------------------------ */

const actualUsername: Entry<string, State> = {
    label: 'Username',
    tooltip: 'The user to log in as.',
    defaultValue: '',
    transform: (_, state) => getUsername(state.username, state.address),
};

const apopResponse: Entry<string, State> = {
    label: 'Response',
    tooltip: 'hex(md5(challenge + password))',
    defaultValue: '',
    transform: (_, state) => toApopEncoding(encodeIdentifier(state.challenge), state.password),
};

/* ------------------------------ User interface ------------------------------ */

export const toolProtocolPop3: Tool = [
    <Fragment>
        <Input inColumns/>
        <CodeBlock>
            <StaticPrompt>
                <OutputEntries entries={{ openssl, quiet, crlf, starttls, connect, server }}/>:<OutputEntries entries={{ port }}/>
            </StaticPrompt>
            <SystemReply>
                <OutputEntries entries={{ OK, implementation, ready, challenge }}/>
            </SystemReply>
            <IfCase entry="credential" value="plain">
                <UserCommand>
                    <OutputEntries entries={{ USER, actualUsername }}/>
                </UserCommand>
                <SystemReply>
                    <OutputEntries entries={{ OK }}/>
                </SystemReply>
                <UserCommand>
                    <OutputEntries entries={{ PASS, password }}/>
                </UserCommand>
            </IfCase>
            <IfCase entry="credential" value="hashed">
                <UserCommand>
                    <OutputEntries entries={{ APOP, actualUsername, apopResponse }}/>
                </UserCommand>
            </IfCase>
            <SystemReply>
                <OutputEntries entries={{ OK, loggedIn }}/>
            </SystemReply>
            <UserCommand>
                <OutputEntries entries={{ LIST }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ OK, messages }}/>
            </SystemReply>
            <SystemReply>
                <OutputEntries entries={{ messageNumber, messageSize }}/>
            </SystemReply>
            <SystemReply>
                <OutputEntries entries={{ period }}/>
            </SystemReply>
            <UserCommand>
                <OutputEntries entries={{ RETR, messageNumber }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ OK, messageFollows }}/>
            </SystemReply>
            <SystemReply>
                <OutputEntries entries={{ messagePlaceholder }}/>
            </SystemReply>
            <SystemReply>
                <OutputEntries entries={{ period }}/>
            </SystemReply>
            <IfEntries entries={{ deletion }}>
                <UserCommand>
                    <OutputEntries entries={{ DELE, messageNumber }}/>
                </UserCommand>
                <SystemReply>
                    <OutputEntries entries={{ OK, messageDeletion }}/>
                </SystemReply>
            </IfEntries>
            <UserCommand>
                <OutputEntries entries={{ QUIT }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ OK, loggingOut }}/>
            </SystemReply>
        </CodeBlock>
    </Fragment>,
    store,
];
