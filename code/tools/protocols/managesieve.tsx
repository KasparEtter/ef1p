/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { toPlainEncoding } from '../../utility/encoding';
import { doubleQuote, doubleQuoteIfWhitespace, normalizeNewlines } from '../../utility/string';

import { CodeBlock, SystemReply, UserCommand } from '../../react/code';
import { DynamicEntry, Entry } from '../../react/entry';
import { getIfCase } from '../../react/if-case';
import { getIfEntries } from '../../react/if-entries';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { StaticPrompt } from '../../react/prompt';
import { DynamicEntries, getCurrentState, getPersistedStore, setState } from '../../react/state';

import { connect, crlf, domainRegex, quiet, usernameRegex } from './esmtp';

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 260;

const openssl: DynamicEntry<string, State> = {
    name: 'OpenSSL',
    description: 'The name or path of your OpenSSL command.',
    defaultValue: 'openssl',
    inputType: 'text',
    inputWidth,
    transform: doubleQuoteIfWhitespace,
};

const server: DynamicEntry<string, State> = {
    name: 'Server',
    description: 'The server to connect to. This time you have to configure it manually.',
    defaultValue: 'sieve.example.org',
    inputType: 'text',
    inputWidth,
    validate: value => !domainRegex.test(value) && 'Please enter a domain name in the preferred name syntax.',
};

const port: DynamicEntry<number, State> = {
    name: 'Port',
    description: 'The port number of the ManageSieve protocol on the server.',
    defaultValue: 4190,
    inputType: 'number',
    inputWidth: inputWidth / 2,
    minValue: 1,
    maxValue: 65535,
    validate: value => (value < 1 || value > 65535) && 'The port has to be a number between 1 and 65535.',
};

const username: DynamicEntry<string, State> = {
    name: 'Username',
    description: 'The username of your account.',
    defaultValue: 'alice@example.org',
    inputType: 'text',
    inputWidth,
    validate: value => !usernameRegex.test(value) && 'Please enter a valid email address or local part.',
};

const password: DynamicEntry<string, State> = {
    name: 'Password',
    description: 'The password of your account. I recommend you to set up a test account for this.',
    defaultValue: '',
    inputType: 'password',
    inputWidth,
    placeholder: 'Your password',
};

const list: DynamicEntry<boolean, State> = {
    name: 'List',
    description: 'Whether to list existing scripts on the server.',
    defaultValue: false,
    inputType: 'checkbox',
};

const action: DynamicEntry<string, State> = {
    name: 'Action',
    description: 'What you want to do.',
    defaultValue: 'PUTSCRIPT',
    inputType: 'select',
    selectOptions: {
        'PUTSCRIPT': 'Upload',
        'GETSCRIPT': 'Download',
        'SETACTIVE': 'Activate',
        'DELETESCRIPT': 'Delete',
        'RENAMESCRIPT': 'Rename',
    },
};

// Escaping backslashes and double quotes is correct:
// https://datatracker.ietf.org/doc/html/rfc5804#section-4
const name: DynamicEntry<string, State> = {
    name: 'Name',
    description: 'The name of the script.',
    defaultValue: 'MyScript',
    inputType: 'text',
    inputWidth,
    transform: doubleQuote,
};

const script: DynamicEntry<string, State> = {
    name: 'Script',
    description: 'The ManageSieve script to upload to the server.',
    defaultValue: 'require "body";\nif body :contains "Test" {\n    discard;\n}',
    inputType: 'textarea',
    inputWidth,
    rows: 4,
    disable: ({ action }) => action !== 'PUTSCRIPT',
};

interface State {
    openssl: string;
    server: string;
    port: number;
    username: string;
    password: string;
    list: boolean;
    action: string;
    name: string;
    script: string;
}

const entries: DynamicEntries<State> = {
    openssl,
    server,
    port,
    username,
    password,
    list,
    action,
    name,
    script,
};

const store = getPersistedStore(entries, 'protocol-managesieve');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);
const IfCase = getIfCase(store);
const IfEntries = getIfEntries(store);

export function setOpenSslCommand(openssl: string): void {
    setState(store, { openssl });
}

export function getOpenSslCommand(): string {
    return getCurrentState(store).openssl;
}

/* ------------------------------ Openssl entries ------------------------------ */

const sClient: Entry<string> = {
    name: 'Option',
    description: 'The option to open a TLS connection as a client.',
    defaultValue: 's_client',
};

const starttls: Entry<string> = {
    name: 'Option',
    description: 'Send the ManageSieve-specific command sequence to start TLS for the rest of the communication.',
    defaultValue: '-starttls sieve',
};

/* ------------------------------ Response entries ------------------------------ */

const OK: Entry<string> = {
    name: 'Status response',
    description: 'Everything went fine.',
    defaultValue: 'OK',
};

const completed: Entry<string> = {
    name: 'Description',
    description: 'An optional text for human users.',
    defaultValue: 'completed.',
};

/* ------------------------------ Capability entries ------------------------------ */

const IMPLEMENTATION: Entry<string> = {
    name: 'Capability',
    description: 'The name and version of the server implementation.',
    defaultValue: '"IMPLEMENTATION" "{NameAndVersion}"',
};

const SIEVE: Entry<string> = {
    name: 'Capability',
    description: 'The supported extensions to the Sieve mail filtering language.',
    defaultValue: '"SIEVE" "{Extensions}"',
};

const NOTIFY: Entry<string> = {
    name: 'Capability',
    description: 'The supported notification methods of the "enotify" extension.',
    defaultValue: '"NOTIFY" "{Methods}"',
};

const SASL: Entry<string> = {
    name: 'Capability',
    description: 'The supported authentication mechanisms. This tool requires that PLAIN is one of them.',
    defaultValue: '"SASL" "PLAIN"',
};

const VERSION: Entry<string> = {
    name: 'Capability',
    description: 'The version of the supported ManageSieve protocol.',
    defaultValue: '"VERSION" "1.0"',
};

const STARTTLS: Entry<string> = {
    name: 'Command',
    description: 'The command to upgrade the TCP channel to TLS.',
    defaultValue: 'STARTTLS',
};

/* ------------------------------ Authentication entries ------------------------------ */

const AUTHENTICATE: Entry<string> = {
    name: 'Command',
    description: 'The command to authenticate the user before taking any other action.',
    defaultValue: 'AUTHENTICATE',
};

const PLAIN: Entry<string> = {
    name: 'Mechanism',
    description: 'Make sure that "PLAIN" is among the authentication mechanisms offered by the server.',
    defaultValue: doubleQuote('PLAIN'),
};

const usernameAndPassword: Entry<string, State> = {
    name: 'Argument',
    description: 'base64Encode(NULL + username + NULL + password)',
    defaultValue: '',
    transform: (_, state) => doubleQuote(toPlainEncoding(state.username, state.password)),
};

/* ------------------------------ List entries ------------------------------ */

const LISTSCRIPTS: Entry<string> = {
    name: 'Command',
    description: 'The command to list the name of all the scripts the user has on the server.',
    defaultValue: 'LISTSCRIPTS',
};

const ActiveScript: Entry<string> = {
    name: 'Script name',
    description: 'The name of the active script.',
    defaultValue: doubleQuote('ActiveScript'),
};

const InactiveScript: Entry<string> = {
    name: 'Script name',
    description: 'The name of an inactive script.',
    defaultValue: doubleQuote('InactiveScript'),
};

const ACTIVE: Entry<string> = {
    name: 'Marker',
    description: 'This marker is appended to the active script.',
    defaultValue: 'ACTIVE',
};

/* ------------------------------ Upload entries ------------------------------ */

const CHECKSCRIPT: Entry<string> = {
    name: 'Command',
    description: 'The command to check the given script without storing it.',
    defaultValue: 'CHECKSCRIPT',
};

const calculatedLength: Entry<string, State> = {
    name: 'Length',
    description: 'The length of the given script in bytes.',
    defaultValue: '',
    transform: (_, state) => `{${normalizeNewlines(state.script).length + 2}+}`,
};

const PUTSCRIPT: Entry<string> = {
    name: 'Command',
    description: 'The command to store the given script with the given name on the server.',
    defaultValue: 'PUTSCRIPT',
};

/* ------------------------------ Download entries ------------------------------ */

const GETSCRIPT: Entry<string> = {
    name: 'Command',
    description: 'The command to retrieve the script with the given name.',
    defaultValue: 'GETSCRIPT',
};

const staticLength: Entry<string> = {
    name: 'Length',
    description: 'The length of the retrieved script in bytes.',
    defaultValue: '{{Length}}',
};

const staticScript: Entry<string> = {
    name: 'Script',
    description: 'The retrieved script.',
    defaultValue: '{Script}',
};

/* ------------------------------ Activate entries ------------------------------ */

const SETACTIVE: Entry<string> = {
    name: 'Command',
    description: 'The command to activate the script with the given name.',
    defaultValue: 'SETACTIVE',
};

/* ------------------------------ Delete entries ------------------------------ */

const DELETESCRIPT: Entry<string> = {
    name: 'Command',
    description: 'The command to delete the script with the given name.',
    defaultValue: 'DELETESCRIPT',
};

/* ------------------------------ Rename entries ------------------------------ */

const RENAMESCRIPT: Entry<string> = {
    name: 'Command',
    description: 'The command to rename the script with the given name.',
    defaultValue: 'RENAMESCRIPT',
};

const newName: Entry<string> = {
    name: 'New name',
    description: 'The new name of the script with the given name.',
    defaultValue: doubleQuote('{NewName}'),
};

/* ------------------------------ Logout entries ------------------------------ */

const LOGOUT: Entry<string> = {
    name: 'Command',
    description: 'The command to terminate the connection.',
    defaultValue: 'LOGOUT',
};

/* ------------------------------ User interface ------------------------------ */

export const toolProtocolManageSieve = <Fragment>
    <Input newColumnAt={6}/>
    <CodeBlock>
        <StaticPrompt>
            <OutputEntries entries={{ openssl, sClient, quiet, crlf, starttls, connect, server }}/>:<OutputEntries entries={{ port }}/>
        </StaticPrompt>
        <SystemReply>
            <OutputEntries entries={{ IMPLEMENTATION, NOTIFY, SASL, SIEVE, VERSION }} outputSeparator={<br/>}/><br/>
            <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ STARTTLS, completed }}/>"
        </SystemReply>
        <UserCommand>
            <OutputEntries entries={{ AUTHENTICATE, PLAIN, usernameAndPassword }}/>
        </UserCommand>
        <SystemReply>
            <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ AUTHENTICATE, completed }}/>"
        </SystemReply>
        <IfEntries entries={{ list }}>
            <UserCommand>
                <OutputEntries entries={{ LISTSCRIPTS }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ ActiveScript, ACTIVE }}/><br/>
                <OutputEntries entries={{ InactiveScript }}/><br/>
                <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ LISTSCRIPTS, completed }}/>"
            </SystemReply>
        </IfEntries>
        <IfCase entry="action" value="PUTSCRIPT">
            <UserCommand>
                <OutputEntries entries={{ CHECKSCRIPT, calculatedLength }}/><br/>
                <OutputEntries entries={{ script }}/><br/>
            </UserCommand><br/>
            <SystemReply>
                <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ CHECKSCRIPT, completed }}/>"
            </SystemReply>
            <UserCommand>
                <OutputEntries entries={{ PUTSCRIPT, name, calculatedLength }}/><br/>
                <OutputEntries entries={{ script }}/><br/>
            </UserCommand><br/>
            <SystemReply>
                <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ PUTSCRIPT, completed }}/>"
            </SystemReply>
            <UserCommand>
                <OutputEntries entries={{ SETACTIVE, name }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ SETACTIVE, completed }}/>"
            </SystemReply>
        </IfCase>
        <IfCase entry="action" value="GETSCRIPT">
            <UserCommand>
                <OutputEntries entries={{ GETSCRIPT, name }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ staticLength }}/><br/>
                <OutputEntries entries={{ staticScript }}/><br/><br/>
                <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ GETSCRIPT, completed }}/>"
            </SystemReply>
        </IfCase>
        <IfCase entry="action" value="SETACTIVE">
            <UserCommand>
                <OutputEntries entries={{ SETACTIVE, name }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ SETACTIVE, completed }}/>"
            </SystemReply>
        </IfCase>
        <IfCase entry="action" value="DELETESCRIPT">
            <UserCommand>
                <OutputEntries entries={{ DELETESCRIPT, name }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ DELETESCRIPT, completed }}/>"
            </SystemReply>
        </IfCase>
        <IfCase entry="action" value="RENAMESCRIPT">
            <UserCommand>
                <OutputEntries entries={{ RENAMESCRIPT, name, newName }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ RENAMESCRIPT, completed }}/>"
            </SystemReply>
        </IfCase>
        <UserCommand>
            <OutputEntries entries={{ LOGOUT }}/>
        </UserCommand>
        <SystemReply>
            <OutputEntries entries={{ OK }}/> "<OutputEntries entries={{ LOGOUT, completed }}/>"
        </SystemReply>
    </CodeBlock>
</Fragment>;

export const toolProtocolManageSieveOpenSsl = <Input entries={{ openssl }}/>;
export const openSslCommand = <OutputEntries entries={{ openssl }}/>;
