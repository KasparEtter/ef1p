/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { toApopEncoding } from '../../utility/encoding';
import { Dictionary, reverseLookup } from '../../utility/record';

import { CodeBlock, SystemReply, UserCommand } from '../../react/code';
import { DynamicEntry, Entry } from '../../react/entry';
import { getIfCase } from '../../react/if-case';
import { getIfEntries } from '../../react/if-entries';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { StaticPrompt } from '../../react/prompt';
import { DynamicEntries, getPersistedStore, mergeIntoCurrentState } from '../../react/state';

import { findConfigurationFile, SocketType } from '../../apis/email-configuration';

import { connect, crlf, domainRegex, emailAddressRegex, getDomain, getUsername, identifierRegex, implementation, maxPortNumber, minPortNumber, openssl, quiet } from './esmtp';

/* ------------------------------ Entry updates ------------------------------ */

function updatePort(_: string, state: State, fromHistory: boolean): void {
    if (!fromHistory) {
        if (state.security === 'implicit') {
            mergeIntoCurrentState(store, { 'port': 995 });
        } else {
            mergeIntoCurrentState(store, { 'port': 110 });
        }
    }
}

const socketTypeLookup: Dictionary<SocketType> = {
    'implicit': 'SSL',
    'explicit': 'STARTTLS',
};

let lastSecurity = '';
let lastAddress = '';
// We're not relying on the change ID because we trigger another change in this function.
async function updateServer(_: string, state: State, fromHistory: boolean): Promise<void> {
    if (fromHistory) {
        lastSecurity = '';
        lastAddress = '';
        return;
    }
    const { security, address } = state;
    // Prevent multiple executions due to being registered for several entries.
    if (security === lastSecurity && address === lastAddress) {
        return;
    }
    lastSecurity = security;
    lastAddress = address;
    const domain = getDomain(address);
    if (/^example\.(org|com|net)$/i.test(domain)) {
        mergeIntoCurrentState(store, { 'server': 'pop3.' + domain });
    } else {
        const configuration = await findConfigurationFile(domain, [], true);
        const pop3Servers = (configuration?.incomingServers ?? []).filter(server => server.type === 'pop3');
        if (pop3Servers.length > 0) {
            const desiredServer = pop3Servers.filter(server => server.socket === socketTypeLookup[security]);
            const server = desiredServer.length > 0 ? desiredServer[0] : pop3Servers[0];
            lastSecurity = reverseLookup(socketTypeLookup, server.socket) ?? 'implicit';
            mergeIntoCurrentState(store, {
                'security': lastSecurity,
                'server': server.host,
                'port': parseInt(server.port, 10),
                'username': server.username === '%EMAILLOCALPART%' ? 'local' : 'full',
                'credential': server.authentication.includes('password-encrypted') ? 'hashed' : 'plain',
            });
        } else {
            mergeIntoCurrentState(store, { 'server': '' }, { 'server': 'Could not find the server. Please enter it manually.' });
        }
    }
}

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 240;

const address: DynamicEntry<string, State> = {
    name: 'Address',
    description: 'The address of your mailbox.',
    defaultValue: 'alice@example.org',
    inputType: 'text',
    inputWidth,
    validate: value => !emailAddressRegex.test(value) && 'Please enter a single email address.',
    onChange: updateServer,
};

const password: DynamicEntry<string, State> = {
    name: 'Password',
    description: 'The password of your account. I recommend you to set up a test account for this.',
    defaultValue: '',
    inputType: 'password',
    inputWidth,
    placeholder: 'Your password',
};

const security: DynamicEntry<string, State> = {
    name: 'Security',
    description: 'Select which variant of TLS you want to use.',
    defaultValue: 'implicit',
    inputType: 'select',
    selectOptions: {
        implicit: 'Implicit TLS',
        explicit: 'Explicit TLS',
    },
    onChange: [updatePort, updateServer],
};

const server: DynamicEntry<string, State> = {
    name: 'Server',
    description: 'The server to connect to. The server is determined automatically if possible but you can also set it manually.',
    defaultValue: 'pop3.example.org',
    inputType: 'text',
    inputWidth,
    validate: value => !domainRegex.test(value) && 'Please enter a domain name in the preferred name syntax.',
};

const port: DynamicEntry<number, State> = {
    name: 'Port',
    description: 'The port number of the server. The port number is determined automatically but you can also set the value manually.',
    defaultValue: 995,
    inputType: 'number',
    inputWidth: inputWidth / 2,
    minValue: minPortNumber,
    maxValue: maxPortNumber,
    // suggestedValues: [110, 995],
};

const username: DynamicEntry<string, State> = {
    name: 'Username',
    description: 'Select how to determine the username for authentication.',
    defaultValue: 'full',
    inputType: 'select',
    selectOptions: {
        full: 'Full address',
        local: 'Local part',
    },
};

const credential: DynamicEntry<string, State> = {
    name: 'Credential',
    description: 'Select how to authenticate towards the server.',
    defaultValue: 'plain',
    inputType: 'select',
    selectOptions: {
        plain: 'Plain password (PLAIN)',
        hashed: 'Hashed password (APOP)',
    },
};

const challenge: DynamicEntry<string, State> = {
    name: 'Challenge',
    description: 'The challenge received from the server when using the hashed password as the credential.',
    defaultValue: '',
    inputType: 'text',
    inputWidth,
    placeholder: ({ address }) => `<unique@${getDomain(address)}>`,
    disable: ({ credential }) => credential !== 'hashed',
    validate: (value, state) => value !== '' && !identifierRegex.test(value) && 'The challenge looks like an email address in angle brackets.' ||
        state.credential === 'hashed' && value === '' && 'Copy the challenge from the server to this field.',
    skip: state => state.credential !== 'hashed',
};

const deletion: DynamicEntry<boolean, State> = {
    name: 'Delete',
    description: 'Whether to delete the retrieved message on the server.',
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

const store = getPersistedStore(entries, 'protocol-pop3');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);
const IfCase = getIfCase(store);
const IfEntries = getIfEntries(store);

/* ------------------------------ Command entries ------------------------------ */

const starttls: Entry<string, State> = {
    name: 'Option',
    description: 'Send the POP3-specific command sequence to start TLS for the rest of the communication.',
    defaultValue: '-starttls pop3',
    skip: state => state.security !== 'explicit',
};

const USER: Entry<string> = {
    name: 'Command',
    description: 'The command to indicate the user whose messages you would like to retrieve.',
    defaultValue: 'USER',
};

const PASS: Entry<string> = {
    name: 'Command',
    description: 'The command to provide the password of the user for authentication.',
    defaultValue: 'PASS',
};

const APOP: Entry<string> = {
    name: 'Command',
    description: 'The command to provide the username and the response to the challenge.',
    defaultValue: 'APOP',
};

const LIST: Entry<string> = {
    name: 'Command',
    description: `The command to list all messages in the user's mailbox.`,
    defaultValue: 'LIST',
};

const RETR: Entry<string> = {
    name: 'Command',
    description: 'The command to retrieve the message with the given number.',
    defaultValue: 'RETR',
};

const DELE: Entry<string> = {
    name: 'Command',
    description: 'The command to delete the message with the given number.',
    defaultValue: 'DELE',
};

const QUIT: Entry<string> = {
    name: 'Command',
    description: 'The command to commit the deletions and let the server close the TLS connection.',
    defaultValue: 'QUIT',
};

/* ------------------------------ Response entries ------------------------------ */

const OK: Entry<string> = {
    name: 'Status indicator',
    description: 'Everything went fine.',
    defaultValue: '+OK',
};

const ready: Entry<string> = {
    name: 'Description',
    description: 'An optional text for human users.',
    defaultValue: 'ready.',
};

const loggedIn: Entry<string> = {
    name: 'Description',
    description: 'An optional text for human users.',
    defaultValue: 'Logged in.',
};

const loggingOut: Entry<string, State> = {
    name: 'Description',
    description: 'An optional text for human users.',
    defaultValue: 'Logging out.',
    transform: (_, state) => 'Logging out' + (state.deletion ? ', messages deleted.' : '.'),
};

const messages: Entry<string> = {
    name: 'Amount',
    description: 'The number of messages in the mailbox.',
    defaultValue: '1 messages:',
};

const messageNumber: Entry<string> = {
    name: 'Message number',
    description: 'The message number, which is only valid for the duration of the session.',
    defaultValue: '1',
};

const messageSize: Entry<string> = {
    name: 'Message size',
    description: 'The size of the message in bytes.',
    defaultValue: '623',
};

const messageFollows: Entry<string> = {
    name: 'Description',
    description: 'An optional text for human users.',
    defaultValue: 'Message follows:',
};

const messagePlaceholder: Entry<string> = {
    name: 'Message placeholder',
    description: 'The header and the body of the retrieved message.',
    defaultValue: '{HeaderAndBody}',
};

const messageDeletion: Entry<string> = {
    name: 'Description',
    description: 'An optional text for human users.',
    defaultValue: 'Marked to be deleted.',
};

const period: Entry<string> = {
    name: 'Termination',
    description: 'A period on a line of its own indicates the end of the response.',
    defaultValue: '.',
};

/* ------------------------------ Authentication entries ------------------------------ */

const actualUsername: Entry<string, State> = {
    name: 'Username',
    description: 'The user to log in as.',
    defaultValue: '',
    transform: (_, state) => getUsername(state.username, state.address),
};

const apopResponse: Entry<string, State> = {
    name: 'Response',
    description: 'hex(md5(challenge + password))',
    defaultValue: '',
    transform: (_, state) => toApopEncoding(state.challenge, state.password),
};

/* ------------------------------ User interface ------------------------------ */

export const toolProtocolPop3 = <Fragment>
    <Input newColumnAt={5}/>
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
</Fragment>;
