/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { flatten, unique } from '../../utility/array';
import { base64Regex, encodeBase64, encodeEncodedWordIfNecessary, encodeQuotedPrintableIfNecessary, getIanaCharset, isInAsciiRange, toCramMd5Encoding, toPlainEncoding } from '../../utility/encoding';
import { getErrorMessage } from '../../utility/error';
import { normalizeToValue } from '../../utility/normalization';
import { arrayToRecord, Dictionary, reverseLookup } from '../../utility/record';
import { getRandomString, nonEmpty, regex, splitOutsideOfDoubleQuotes } from '../../utility/string';
import { KeysOf } from '../../utility/types';

import { Argument, DynamicArgument } from '../../react/argument';
import { CodeBlock, DynamicOutput, SystemReply, UserCommand } from '../../react/code';
import { DynamicEntry, Entry, ErrorType, isDynamicEntry } from '../../react/entry';
import { getIfCase } from '../../react/if-case';
import { getIfEntries } from '../../react/if-entries';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { getOutputFunction } from '../../react/output-function';
import { StaticPrompt } from '../../react/prompt';
import { DynamicEntries, getPersistedStore, mergeIntoCurrentState, setState } from '../../react/state';
import { Tool } from '../../react/utility';

import { getReverseLookupDomain, resolveDomainName } from '../../apis/dns-lookup';
import { findConfigurationFile, SocketType } from '../../apis/email-configuration';
import { getIpInfo } from '../../apis/ip-geolocation';

/* ------------------------------ Utility functions ------------------------------ */

type AddressField = 'from' | 'to' | 'cc' | 'bcc';

function getAddresses(state: State, field: AddressField): string[] {
    return splitOutsideOfDoubleQuotes(state[field], ',').filter(nonEmpty).map(addressWithDisplayName => {
        addressWithDisplayName = addressWithDisplayName.trim();
        const index = addressWithDisplayName.indexOf('<', addressWithDisplayName.lastIndexOf('"'));
        if (index >= 0) {
            return addressWithDisplayName.slice(index + 1, -1);
        } else {
            return addressWithDisplayName;
        }
    });
}

function getFromAddress(state: State): string {
    return getAddresses(state, 'from')[0];
}

function getRecipientFields(state: State): AddressField[] {
    switch (state.recipients) {
        case 'all': return ['to', 'cc', 'bcc'];
        case 'toAndCc': return ['to', 'cc'];
        case 'onlyBcc': return ['bcc'];
        default: throw Error(`Unsupported recipients options '${state.recipients}'.`);
    }
}

function getRecipientAddresses(state: State): string[] {
    return unique(flatten(getRecipientFields(state).map(field => getAddresses(state, field))));
}

export function getDomain(address: string): string {
    return address.substring(address.indexOf('@') + 1);
}

export function getLocalPart(address: string): string {
    return address.substring(0, address.indexOf('@'));
}

export function getUsername(username: string, address: string): string {
    switch (username) {
        case 'full': return address;
        case 'local': return getLocalPart(address);
        default: throw Error(`Unsupported username format '${username}'.`);
    }
}

function determineDate(): string {
    const [weekday, month, day, year, time, zone] = new Date().toString().split(' ');
    return `${weekday}, ${day} ${month} ${year} ${time} ${zone.substring(3)}`;
}

function determineIdentifier(state: State): string {
    const randomness = getRandomString() + getRandomString();
    const domain = getDomain(getFromAddress(state));
    return `<${randomness}@${domain}>`;
}

/* ------------------------------ Entry updates ------------------------------ */

function updatePort(_: string, state: State, fromHistory: boolean): void {
    if (fromHistory) {
        return;
    }
    if (state.mode === 'submission') {
        if (state.security === 'implicit') {
            mergeIntoCurrentState(store, { 'port': 465 });
        } else {
            mergeIntoCurrentState(store, { 'port': 587 });
        }
    } else {
        mergeIntoCurrentState(store, { 'port': 25 });
    }
}

const socketTypeLookup: Dictionary<SocketType> = {
    'implicit': 'SSL',
    'explicit': 'STARTTLS',
    'none': 'plain',
};

let lastMode = '';
let lastSecurity = '';
let lastDomain = '';
// We're not relying on the change ID because we trigger another change in this function.
async function updateServer(_: string, state: State, fromHistory: boolean): Promise<void> {
    if (fromHistory) {
        lastMode = '';
        lastSecurity = '';
        lastDomain = '';
        return;
    }
    const { mode, security, domain } = state;
    // Prevent multiple executions due to being registered for several entries.
    if (mode === lastMode && security === lastSecurity && domain === lastDomain) {
        return;
    }
    lastMode = mode;
    lastSecurity = security;
    lastDomain = domain;
    if (mode === 'submission') {
        if (/^example\.(org|com|net)$/i.test(domain)) {
            mergeIntoCurrentState(store, { 'server': 'submission.' + domain });
        } else {
            const configuration = await findConfigurationFile(domain, [], true);
            if (configuration && configuration.outgoingServers.length > 0) {
                const desiredServer = configuration.outgoingServers.filter(server => server.socket === socketTypeLookup[security]);
                const server = desiredServer.length > 0 ? desiredServer[0] : configuration.outgoingServers[0];
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
    } else { // Relay
        if (/^example\.(org|com|net)$/i.test(domain)) {
            mergeIntoCurrentState(store, { 'server': 'relay.' + domain });
        } else {
            try {
                const response = await resolveDomainName(domain, 'MX');
                const records = response.answer.filter(record => record.type === 'MX').map(record => {
                    const parts = record.data.split(' ');
                    if (parts.length !== 2) {
                        throw new Error('Received an invalid MX record.');
                    }
                    if (parts[1] === '.') {
                        throw new Error(`${domain} does not support email.`);
                    }
                    return [parseInt(parts[0], 10), parts[1].slice(0, -1)] as [number, string];
                });
                if (records.length > 0) {
                    records.sort((a, b) => a[0] - b[0]);
                    mergeIntoCurrentState(store, { 'server': records[0][1] });
                } else {
                    mergeIntoCurrentState(store, { 'server': domain });
                }
            } catch (error) {
                mergeIntoCurrentState(store, { 'server': '' }, { 'server': getErrorMessage(error) });
            }
        }
    }
}

async function updateClient(): Promise<[string, ErrorType]> {
    try {
        const { ip } = await getIpInfo();
        const response = await resolveDomainName(getReverseLookupDomain(ip), 'PTR');
        const records = response.answer.filter(record => record.type === 'PTR');
        if (records.length > 0) {
            return [records[0].data.slice(0, -1), false];
        } else {
            return [`[${ip}]`, false];
        }
    } catch (error) {
        return ['', getErrorMessage(error)];
    }
}

function updateMessageHeaders(_: string, state: State, fromHistory: boolean): void {
    if (!fromHistory) {
        mergeIntoCurrentState(store, {
            'date': determineDate(),
            'identifier': determineIdentifier(state),
        });
    }
}

/* ------------------------------ Regular expressions ------------------------------ */

// All the following regular expressions should be used with the case insensitive flag.
const ip4RegexString = `(\\[\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\])`;
const domainRegexString = `(([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\\.)*[a-z][-a-z0-9]{0,61}[a-z0-9])`;
const deviceAddressRegexString = `(${ip4RegexString}|${domainRegexString}|localhost)`;
const localPartCharacters = `[a-z0-9!#$%&'*+\\/=?^_\`{|}~-]`;
const localPartRegexString = `(${localPartCharacters}+(\\.${localPartCharacters}+)*)`; // No quoted strings.
const displayNameRegexString = `((${localPartCharacters}+( *${localPartCharacters}+)*)|"[^"]*")`;
export const emailAddressRegexString = `(${localPartRegexString}@${domainRegexString})`;
const emailAddressesRegexString = `(${emailAddressRegexString}(, *${emailAddressRegexString})*)?`;
const addressWithNameRegexString = `( *(${emailAddressRegexString}|(${displayNameRegexString}? *\\<${emailAddressRegexString}\\>)) *)`;
const addressesWithNameRegexString = `(${addressWithNameRegexString}(,${addressWithNameRegexString})*)?`;

export const domainRegex = regex(domainRegexString);
const deviceAddressRegex = regex(deviceAddressRegexString);
export const emailAddressRegex = regex(emailAddressRegexString);
export const emailAddressesRegex = regex(emailAddressesRegexString);
export const usernameRegex = regex(`(${emailAddressRegexString}|${localPartRegexString})`);
const addressWithNameRegex = regex(addressWithNameRegexString);
const addressesWithNameRegex = regex(addressesWithNameRegexString);

const dateRegexString = `([A-Z][a-z]{2}, \\d{2} [A-Z][a-z]{2} \\d{4} \\d{2}:\\d{2}:\\d{2} (\\+|\\-)\\d{4})`;
const dateRegex = regex(dateRegexString);

const identifierRegexString = `(\\<${emailAddressRegexString}\\>)`;
export const identifierRegex = regex(identifierRegexString);

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 300;

const mode: DynamicEntry<string, State> = {
    name: 'Mode',
    description: 'Select whether you want to use SMTP for submission or for relay.',
    defaultValue: 'submission',
    inputType: 'select',
    selectOptions: {
        submission: 'Submission',
        relay: 'Relay',
    },
    onChange: [updatePort, updateServer],
};

const security: DynamicEntry<string, State> = {
    name: 'Security',
    description: 'Select which variant of TLS you want to use.',
    defaultValue: 'implicit',
    inputType: 'select',
    selectOptions: (state: State) => (state.mode === 'submission' ? {
        implicit: 'Implicit TLS',
        explicit: 'Explicit TLS',
    } as Record<string, string> : {
        explicit: 'Explicit TLS',
        none: 'No TLS',
    } as Record<string, string>),
    onChange: [updatePort, updateServer],
};

const recipients: DynamicEntry<string, State> = {
    name: 'Recipients',
    description: 'Select the group of recipients to which you want to send the message.',
    defaultValue: 'all',
    inputType: 'select',
    selectOptions: state => {
        const result: Record<string, string> = { all: 'All' };
        if (getAddresses(state, 'to').length > 0 || getAddresses(state, 'cc').length > 0) {
            result.toAndCc = 'To and Cc';
        }
        if (getAddresses(state, 'bcc').length > 0) {
            result.onlyBcc = 'Only Bcc';
        }
        return result;
    },
};

const domain: DynamicEntry<string, State> = {
    name: 'Domain',
    description: 'Select the email domain to which you want to submit or relay the message. The value can only be changed in the case of relay.',
    defaultValue: 'example.org',
    inputType: 'select',
    selectOptions: state => arrayToRecord((state.mode === 'submission' ? getAddresses(state, 'from') : getRecipientAddresses(state)).map(getDomain)),
    disable: ({ mode }) => mode === 'submission',
    onChange: [updatePort, updateServer],
};

const server: DynamicEntry<string, State> = {
    name: 'Server',
    description: 'The server to connect to. The server is determined automatically if possible but you can also set it manually.',
    defaultValue: 'submission.example.org',
    inputType: 'text',
    inputWidth,
    validate: value => !domainRegex.test(value) && 'Please enter a domain name in the preferred name syntax.',
};

export const minPortNumber = 1;
export const maxPortNumber = 65535;

const port: DynamicEntry<number, State> = {
    name: 'Port',
    description: 'The port number of the server. The port number is determined automatically but you can also set the value manually.',
    defaultValue: 465,
    inputType: 'number',
    inputWidth: inputWidth / 2,
    minValue: minPortNumber,
    maxValue: maxPortNumber,
    // suggestedValues: [25, 465, 587],
};

const client: DynamicEntry<string, State> = {
    name: 'Client',
    description: 'The IP or DNS address of your machine. Click on "Determine" to look it up or set it manually.',
    defaultValue: 'localhost',
    inputType: 'text',
    inputWidth: inputWidth - 90,
    validate: value => !deviceAddressRegex.test(value) && 'Please enter a domain name or an IPv4 address in brackets.',
    determine: {
        text: 'Determine',
        title: 'Determine the IP or DNS address of your machine.',
        onClick: updateClient,
    },
};

const pipelining: DynamicEntry<boolean, State> = {
    name: 'Pipelining',
    description: 'Whether to send several commands at once. Only activate this if the server lists PIPELINING in its response to the EHLO command.',
    defaultValue: false,
    inputType: 'checkbox',
}

const username: DynamicEntry<string, State> = {
    name: 'Username',
    description: 'Select how to determine the username for authentication. This is only relevant for submission.',
    defaultValue: 'full',
    inputType: 'select',
    selectOptions: {
        full: 'Full address',
        local: 'Local part',
    },
    disable: ({ mode }) => mode === 'relay',
};

const credential: DynamicEntry<string, State> = {
    name: 'Credential',
    description: 'Select how to authenticate towards the server. This is only relevant for submission.',
    defaultValue: 'plain',
    inputType: 'select',
    selectOptions: {
        plain: 'Plain password (PLAIN)',
        login: 'Plain password (LOGIN)',
        hashed: 'Hashed password (CRAM-MD5)',
    },
    disable: ({ mode }) => mode === 'relay',
};

const password: DynamicEntry<string, State> = {
    name: 'Password',
    description: 'The password of your account. I recommend you to set up a test account for this. This is only relevant for submission.',
    defaultValue: '',
    inputType: 'password',
    inputWidth,
    placeholder: 'Your password',
    disable: ({ mode }) => mode === 'relay',
};

const challenge: DynamicEntry<string, State> = {
    name: 'Challenge',
    description: 'The challenge received from the server when using the hashed password as the credential for submission.',
    defaultValue: '',
    inputType: 'text',
    inputWidth,
    placeholder: 'CRAM-MD5 challenge from the server',
    disable: ({ mode, credential }) => mode !== 'submission' || credential !== 'hashed',
    validate: (value, state) => !base64Regex.test(value) && 'This is not a valid Base64 string.' ||
        state.credential === 'hashed' && value === '' && 'Copy the Base64-encoded challenge from the server to this field.',
};

const from: DynamicArgument<string, State> = {
    name: 'From',
    longForm: 'From:',
    description: 'A single "From" address with an optional display name.',
    defaultValue: 'Alice <alice@example.org>',
    inputType: 'text',
    inputWidth,
    validate: value => !addressWithNameRegex.test(value) && 'Please enter a single address with an optional display name.',
    onChange: updateMessageHeaders,
};

function validateRecipientField(value: string, state: State): ErrorType {
    return !addressesWithNameRegex.test(value) && 'Please enter a comma-separated list of addresses.' ||
        state.to ===  '' && state.cc === '' && state.bcc === '' && 'At least one recipient has to be provided.';
}

const to: DynamicArgument<string, State> = {
    name: 'To',
    longForm: 'To:',
    description: 'One or several "To" addresses with optional display names.',
    defaultValue: 'Bob <bob@example.com>',
    inputType: 'text',
    inputWidth,
    validate: validateRecipientField,
    onChange: updateMessageHeaders,
};

const cc: DynamicArgument<string, State> = {
    name: 'Cc',
    longForm: 'Cc:',
    description: 'One or several "Cc" addresses with optional display names.',
    defaultValue: 'Carol <carol@example.com>',
    inputType: 'text',
    inputWidth,
    validate: validateRecipientField,
    onChange: updateMessageHeaders,
};

const bcc: DynamicArgument<string, State> = {
    name: 'Bcc',
    longForm: 'Bcc:',
    description: 'One or several "Bcc" addresses with optional display names.',
    defaultValue: 'Dave <dave@example.net>',
    inputType: 'text',
    inputWidth,
    validate: validateRecipientField,
    onChange: updateMessageHeaders,
};

const subject: DynamicArgument<string, State> = {
    name: 'Subject',
    longForm: 'Subject:',
    description: 'The subject of the message you want to send.',
    defaultValue: 'Yet another message',
    inputType: 'text',
    inputWidth,
    transform: encodeEncodedWordIfNecessary,
    onChange: updateMessageHeaders,
};

const date: DynamicArgument<string, State> = {
    name: 'Date',
    longForm: 'Date:',
    description: 'The date and time at which the message was completed. This field is updated automatically but you can also set the value manually.',
    defaultValue: determineDate(),
    inputType: 'text',
    inputWidth,
    placeholder: determineDate(),
    validate: value => !dateRegex.test(value) && 'Please enter a date in the same format as provided.',
}

const identifier: DynamicArgument<string, State> = {
    name: 'Identifier',
    longForm: 'Message-ID:',
    description: 'An identifier which uniquely identifies this message. This field is updated automatically but you can also set the value manually.',
    defaultValue: '<unique-identifier@example.org>',
    inputType: 'text',
    inputWidth,
    placeholder: '<unique-identifier@example.org>',
    validate: value => !identifierRegex.test(value) && 'Please enter a message ID in the same format as provided.',
}

const contentOptions = [
    'text/plain',
    'text/enriched',
    'text/html',
    'multipart/mixed',
    'multipart/alternative',
    'multipart/related',
];

const content: DynamicEntry<string, State> = {
    name: 'Content',
    description: 'Select the content type of the message. See the format section for more information.',
    defaultValue: 'text/plain',
    inputType: 'select',
    selectOptions: arrayToRecord(contentOptions),
};

const body: DynamicEntry<string, State> = {
    name: 'Body',
    description: 'The content of the message you want to send.',
    defaultValue: 'Hello,\n\nIt\'s me. Again.\n\nAlice',
    inputType: 'textarea',
    inputWidth,
    rows: 4,
    transform: encodeQuotedPrintableIfNecessary,
    onChange: updateMessageHeaders,
};

interface State {
    mode: string;
    security: string;
    recipients: string;
    domain: string;
    server: string;
    port: number;
    client: string;
    pipelining: boolean;
    username: string;
    credential: string;
    password: string;
    challenge: string;
    from: string;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    date: string;
    identifier: string;
    content: string;
    body: string;
}

const entries: DynamicEntries<State> = {
    mode,
    security,
    recipients,
    domain,
    server,
    port,
    client,
    pipelining,
    username,
    credential,
    password,
    challenge,
    from,
    to,
    cc,
    bcc,
    subject,
    date,
    identifier,
    content,
    body,
};

const store = getPersistedStore(entries, 'protocol-esmtp');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);
const OutputFunction = getOutputFunction(store);
const IfCase = getIfCase(store);
const IfEntries = getIfEntries(store);

export function setBody(content: string, body: string): void {
    setState(store, { content, body: body.replace(/\\n/g, '\n') });
}

/* ------------------------------ Prompt entries ------------------------------ */

const telnet: Entry<string> = {
    name: 'Command',
    description: 'The command to open a TCP channel to the given server.',
    defaultValue: 'telnet',
};

export const openssl: Entry<string> = {
    name: 'Command',
    description: 'The command to open a TLS channel to the given server as a client.',
    defaultValue: 'openssl s_client',
};

export const quiet: Entry<string> = {
    name: 'Option',
    description: 'This option tells OpenSSL not to output session and certificate information.',
    defaultValue: '-quiet',
};

export const crlf: Entry<string> = {
    name: 'Option',
    description: 'This option translates newlines from the command-line interface into carriage return and line feed characters (CR+LF) as required by the standard.',
    defaultValue: '-crlf',
};

const starttls: Entry<string, State> = {
    name: 'Option',
    description: 'Send the SMTP-specific command sequence to start TLS for the rest of the communication.',
    defaultValue: '-starttls smtp',
    skip: state => state.security !== 'explicit',
};

export const connect: Entry<string> = {
    name: 'Option',
    description: 'The next argument specifies the server address and the port number to connect to.',
    defaultValue: '-connect',
};

/* ------------------------------ Status entries ------------------------------ */

const status220: Entry<string> = {
    name: 'Status',
    description: 'The status code to indicate that the server is ready.',
    defaultValue: '220',
};

const protocol: Entry<string> = {
    name: 'Protocol',
    description: 'Many servers provide the name of the protocol but this is optional.',
    defaultValue: 'ESMTP',
};

export const implementation: Entry<string> = {
    name: 'Implementation',
    description: 'Many servers indicate the name of the server software but this is optional.',
    defaultValue: 'Implementation',
};

const status221: Entry<string> = {
    name: 'Status',
    description: 'The status code to indicate that the server is closing the channel.',
    defaultValue: '221',
};

const bye: Entry<string> = {
    name: 'Description',
    description: 'A short description of the status code for human users.',
    defaultValue: 'Bye',
};

const status235: Entry<string> = {
    name: 'Status',
    description: 'The status code to indicate that the authentication was successful.',
    defaultValue: '235',
};

const successful: Entry<string> = {
    name: 'Description',
    description: 'An enhanced status code followed by a short description of the status code for human users.',
    defaultValue: 'Authentication successful',
};

const status250: Entry<string> = {
    name: 'Status',
    description: 'The status code to indicate that the requested mail action was okay.',
    defaultValue: '250',
};

const ok: Entry<string> = {
    name: 'Description',
    description: 'A short description of the status code for human users.',
    defaultValue: 'Ok',
};

const greets: Entry<string> = {
    name: 'Description',
    description: 'An arbitrary welcome message for human users.',
    defaultValue: 'at your service,',
};

const status334: Entry<string> = {
    name: 'Status',
    description: 'The status code to indicate a Base64-encoded server challenge during authentication.',
    defaultValue: '334',
};

const status354: Entry<string> = {
    name: 'Status',
    description: 'The status code to indicate that the client can submit the message.',
    defaultValue: '354',
};

const endData: Entry<string> = {
    name: 'Description',
    description: 'A short description of the status code for human users. (CR: carriage return, LF: line feed)',
    defaultValue: 'End data with <CR><LF>.<CR><LF>',
};

/* ------------------------------ Enhanced status codes ------------------------------ */

const ENHANCEDSTATUSCODES: Entry<string> = {
    name: 'Extension',
    description: 'This extension defines more precise status codes, which are appended to the original status codes.',
    defaultValue: 'ENHANCEDSTATUSCODES',
};

const enhancedStatus200: Entry<string> = {
    name: 'Enhanced status code',
    description: `The format is "class.subject.detail". The 2 means success and the two 0s mean other, undefined status.`,
    defaultValue: '2.0.0',
};

const enhancedStatus210: Entry<string> = {
    name: 'Enhanced status code',
    description: `The format is "class.subject.detail". The 2 means success, the 1 means it's address-related, and the 0 means other status.`,
    defaultValue: '2.1.0',
};

const enhancedStatus215: Entry<string> = {
    name: 'Enhanced status code',
    description: `The format is "class.subject.detail". The 2 means success, the 1 means it's address-related, and the 5 means that the destination address is valid.`,
    defaultValue: '2.1.5',
};

const enhancedStatus270: Entry<string> = {
    name: 'Enhanced status code',
    description: `The format is "class.subject.detail". The 2 means success, the 7 means it's security-related, and the 0 means other or undefined status.`,
    defaultValue: '2.7.0',
};

/* ------------------------------ Command entries ------------------------------ */

const EHLO: Entry<string> = {
    name: 'Command',
    description: 'The greeting command of ESMTP for disclosing your identity and prompting the server to list its supported extensions.',
    defaultValue: 'EHLO',
};

const PIPELINING: Entry<string> = {
    name: 'Extension',
    description: 'This extension allows the client to send several commands at once.',
    defaultValue: 'PIPELINING',
};

const MAIL_FROM: Entry<string> = {
    name: 'Command',
    description: 'The command to indicate the address to deliver automatic replies, such as bounce messages, to.',
    defaultValue: 'MAIL FROM:',
};

const mailFromTitle = 'Unless an email is forwarded by a mailing list, the "From" address is used as the so-called return path.';

const RCPT_TO: Entry<string> = {
    name: 'Command',
    description: 'The command to indicate a recipient of the message.',
    defaultValue: 'RCPT TO:',
};

const rcptToTitle = 'One of the recipients to which the server shall deliver the message.';

const DATA: Entry<string> = {
    name: 'Command',
    description: 'The command to start the transmission of the message.',
    defaultValue: 'DATA',
};

const period: Entry<string> = {
    name: 'Termination',
    description: 'A period on a line of its own indicates the end of the message.',
    defaultValue: '.',
};

const QUIT: Entry<string> = {
    name: 'Command',
    description: 'The command to request the closure of the transmission channel.',
    defaultValue: 'QUIT',
};

/* ------------------------------ Authentication entries ------------------------------ */

const AUTH: Entry<string> = {
    name: 'Extension',
    description: 'The authentication extension used to authenticate the user before submitting a message.',
    defaultValue: 'AUTH',
};

const PLAIN: Entry<string> = {
    name: 'Mechanism',
    description: 'Make sure that "PLAIN" is among the authentication mechanisms offered by the server.',
    defaultValue: 'PLAIN',
};

const plainArgument: Entry<string, State> = {
    name: 'Argument',
    description: 'base64Encode(NULL + username + NULL + password)',
    defaultValue: '',
    transform: (_, state) => toPlainEncoding(getUsername(state.username, getFromAddress(state)), state.password),
};

const LOGIN: Entry<string> = {
    name: 'Mechanism',
    description: 'Make sure that "LOGIN" is among the authentication mechanisms offered by the server.',
    defaultValue: 'LOGIN',
};

const loginUsernameChallenge: Entry<string> = {
    name: 'Challenge',
    description: 'base64Encode("Username:")',
    defaultValue: encodeBase64('Username:'),
};

const loginUsernameResponse: Entry<string, State> = {
    name: 'Response',
    description: 'base64Encode(username)',
    defaultValue: '',
    transform: (_, state) => encodeBase64(getUsername(state.username, getFromAddress(state))),
};

const loginPasswordChallenge: Entry<string> = {
    name: 'Challenge',
    description: 'base64Encode("Password:")',
    defaultValue: encodeBase64('Password:'),
};

const loginPasswordResponse: Entry<string, State> = {
    name: 'Response',
    description: 'base64Encode(password)',
    defaultValue: '',
    transform: (_, state) => encodeBase64(state.password),
};

const CRAM_MD5: Entry<string> = {
    name: 'Mechanism',
    description: 'Make sure that "CRAM-MD5" is among the authentication mechanisms offered by the server.',
    defaultValue: 'CRAM-MD5',
};

const cramMd5Response: Entry<string, State> = {
    name: 'Response',
    description: 'base64Encode(username + " " + createHmac("md5", password).update(base64Decode(challenge)).digest("hex"))',
    defaultValue: '',
    transform: (_, state) => toCramMd5Encoding(getUsername(state.username, getFromAddress(state)), state.password, state.challenge),
};

/* ------------------------------ Content encoding ------------------------------ */

function dotStuff(body: string): string {
    return body.split('\n').map(line => line.startsWith('.') ? '.' + line : line).join('\n');
}

const dotStuffedBody: Entry<string, State> = {
    name: 'Body',
    description: 'The body of the message. Lines which start with a period are escaped with an additional period.',
    defaultValue: '',
    transform: (_, state) => dotStuff(encodeQuotedPrintableIfNecessary(state.body)),
};

const mimeVersion: Argument<string, State> = {
    name: 'MIME version',
    longForm: 'MIME-Version:',
    description: 'The used version of Multipurpose Internet Mail Extensions (MIME).',
    defaultValue: '1.0',
    skip: state => state.content === 'text/plain' && isInAsciiRange(state.body),
};

const contentType: Argument<string, State> = {
    name: 'Content type',
    longForm: 'Content-Type:',
    description: 'Indicates the content type of the body and the appropriate character set.',
    defaultValue: '',
    skip: state => state.content === 'text/plain' && isInAsciiRange(state.body),
    transform: (_, state) => {
        if (state.content.startsWith('text/')) {
            return state.content + '; charset=' + getIanaCharset(state.body);
        } else if (state.content.startsWith('multipart/')) {
            let result = state.content + '; boundary="UniqueBoundary"';
            if (state.content === 'multipart/related') {
                const match = state.body.match(/Content-Type:\s*(.*?);/i);
                if (match !== null) {
                    result += `; type="${match[1]}"`;
                }
            }
            return result;
        } else {
            console.error('Unknown ESMTP content type:', state.content);
            return 'ERROR';
        }
    },
};

const contentTransferEncoding: Argument<string, State> = {
    name: 'Content transfer encoding',
    longForm: 'Content-Transfer-Encoding:',
    description: 'Indicates that the body has been encoded as quoted-printable (see the section on the format of messages).',
    defaultValue: 'quoted-printable',
    skip: state => isInAsciiRange(state.body),
};

/* ------------------------------ User interface ------------------------------ */

function angleAddress(address: string, title: string): JSX.Element {
    return <DynamicOutput title={title}>&lt;{address}&gt;</DynamicOutput>;
}

export const toolProtocolEsmtp: Tool = [
    <Fragment>
        <Input newColumnAt={12}/>
        <CodeBlock>
            <StaticPrompt>
                <IfCase entry="security" value="none">
                    <OutputEntries entries={{ telnet, server, port }}/>
                </IfCase>
                <IfCase entry="security" value="none" not>
                    <OutputEntries entries={{ openssl, quiet, crlf, starttls, connect, server }}/>:<OutputEntries entries={{ port }}/>
                </IfCase>
            </StaticPrompt>
            <SystemReply>
                <OutputEntries entries={{ status220, server, protocol, implementation }}/>
            </SystemReply>
            <UserCommand>
                <OutputEntries entries={{ EHLO, client }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ status250 }}/>-<OutputEntries entries={{ server, greets, client }}/>
            </SystemReply>
            <IfEntries entries={{ pipelining }} not>
                <IfCase entry="mode" value="relay">
                    <SystemReply>
                        <OutputEntries entries={{ status250, ENHANCEDSTATUSCODES }}/>
                    </SystemReply>
                </IfCase>
                <IfCase entry="mode" value="submission">
                    <SystemReply>
                        <OutputEntries entries={{ status250 }}/>-<OutputEntries entries={{ ENHANCEDSTATUSCODES }}/>
                    </SystemReply>
                    <IfCase entry="credential" value="plain">
                        <SystemReply>
                            <OutputEntries entries={{ status250, AUTH, PLAIN }}/>
                        </SystemReply>
                        <UserCommand>
                            <OutputEntries entries={{ AUTH, PLAIN, plainArgument }}/>
                        </UserCommand>
                    </IfCase>
                    <IfCase entry="credential" value="login">
                        <SystemReply>
                            <OutputEntries entries={{ status250, AUTH, LOGIN }}/>
                        </SystemReply>
                        <UserCommand>
                            <OutputEntries entries={{ AUTH, LOGIN }}/>
                        </UserCommand>
                        <SystemReply>
                            <OutputEntries entries={{ status334, loginUsernameChallenge }}/>
                        </SystemReply>
                        <UserCommand>
                            <OutputEntries entries={{ loginUsernameResponse }}/>
                        </UserCommand>
                        <SystemReply>
                            <OutputEntries entries={{ status334, loginPasswordChallenge }}/>
                        </SystemReply>
                        <UserCommand>
                            <OutputEntries entries={{ loginPasswordResponse }}/>
                        </UserCommand>
                    </IfCase>
                    <IfCase entry="credential" value="hashed">
                        <SystemReply>
                            <OutputEntries entries={{ status250, AUTH, CRAM_MD5 }}/>
                        </SystemReply>
                        <UserCommand>
                            <OutputEntries entries={{ AUTH, CRAM_MD5 }}/>
                        </UserCommand>
                        <SystemReply>
                            <OutputEntries entries={{ status334, challenge }}/>
                        </SystemReply>
                        <UserCommand>
                            <OutputEntries entries={{ cramMd5Response }}/>
                        </UserCommand>
                    </IfCase>
                    <SystemReply>
                        <OutputEntries entries={{ status235, enhancedStatus270, successful }}/>
                    </SystemReply>
                </IfCase>
                <UserCommand>
                    <OutputEntries entries={{ MAIL_FROM }}/>
                    <OutputFunction function={state => angleAddress(getFromAddress(state), mailFromTitle)}/>
                </UserCommand>
                <SystemReply>
                    <OutputEntries entries={{ status250, enhancedStatus210, ok }}/>
                </SystemReply>
                <OutputFunction function={state =>
                    getRecipientAddresses(state).filter(address => state.mode !== 'relay' || getDomain(address) === state.domain).map(recipient => <Fragment>
                        <UserCommand>
                            <OutputEntries entries={{ RCPT_TO }}/>
                            <OutputFunction function={_ => angleAddress(recipient, rcptToTitle)}/>
                        </UserCommand>
                        <SystemReply>
                            <OutputEntries entries={{ status250, enhancedStatus215, ok }}/>
                        </SystemReply>
                    </Fragment>)
                }/>
                <UserCommand>
                    <OutputEntries entries={{ DATA }}/>
                </UserCommand>
                <SystemReply>
                    <OutputEntries entries={{ status354, endData }}/>
                </SystemReply>
                <UserCommand>
                    <OutputEntries entries={{ from, to, cc }} outputSeparator={<br/>}/><br/>
                    <IfCase entry="recipients" value="onlyBcc">
                        <OutputEntries entries={{ bcc }}/><br/>
                    </IfCase>
                    <OutputEntries entries={{ subject, date, identifier, mimeVersion, contentType, contentTransferEncoding }} outputSeparator={<br/>}/><br/><br/>
                    <OutputEntries entries={{ dotStuffedBody, period }} outputSeparator={<br/>}/>
                </UserCommand>
                <SystemReply>
                    <OutputEntries entries={{ status250, enhancedStatus200, ok }}/>
                </SystemReply>
                <UserCommand>
                    <OutputEntries entries={{ QUIT }}/>
                </UserCommand>
                <SystemReply>
                    <OutputEntries entries={{ status221, enhancedStatus200, bye }}/>
                </SystemReply>
            </IfEntries>
            <IfEntries entries={{ pipelining }}>
                <SystemReply>
                    <OutputEntries entries={{ status250 }}/>-<OutputEntries entries={{ ENHANCEDSTATUSCODES }}/>
                </SystemReply>
                <IfCase entry="mode" value="relay">
                    <SystemReply>
                        <OutputEntries entries={{ status250, PIPELINING }}/>
                    </SystemReply>
                    <UserCommand>
                        <OutputEntries entries={{ MAIL_FROM }}/>
                        <OutputFunction function={state => angleAddress(getFromAddress(state), mailFromTitle)}/><br/>
                        <OutputFunction function={state =>
                            getRecipientAddresses(state).filter(address => state.mode !== 'relay' || getDomain(address) === state.domain).map(recipient => <Fragment>
                                <OutputEntries entries={{ RCPT_TO }}/>
                                <OutputFunction function={_ => angleAddress(recipient, rcptToTitle)}/><br/>
                            </Fragment>)
                        }/>
                        <OutputEntries entries={{ DATA }}/>
                    </UserCommand>
                    <SystemReply>
                        <OutputEntries entries={{ status250, enhancedStatus210, ok }}/>
                    </SystemReply>
                    <OutputFunction function={state =>
                        getRecipientAddresses(state).filter(address => state.mode !== 'relay' || getDomain(address) === state.domain).map(_ => <SystemReply>
                            <OutputEntries entries={{ status250, enhancedStatus215, ok }}/>
                        </SystemReply>)
                    }/>
                </IfCase>
                <IfCase entry="mode" value="submission">
                    <SystemReply>
                        <OutputEntries entries={{ status250 }}/>-<OutputEntries entries={{ PIPELINING }}/>
                    </SystemReply>
                    <IfCase entry="credential" value="plain">
                        <SystemReply>
                            <OutputEntries entries={{ status250, AUTH, PLAIN }}/>
                        </SystemReply>
                        <UserCommand>
                            <OutputEntries entries={{ AUTH, PLAIN, plainArgument }}/><br/>
                            <OutputEntries entries={{ MAIL_FROM }}/>
                            <OutputFunction function={state => angleAddress(getFromAddress(state), mailFromTitle)}/><br/>
                            <OutputFunction function={state =>
                                getRecipientAddresses(state).filter(address => state.mode !== 'relay' || getDomain(address) === state.domain).map(recipient => <Fragment>
                                    <OutputEntries entries={{ RCPT_TO }}/>
                                    <OutputFunction function={_ => angleAddress(recipient, rcptToTitle)}/><br/>
                                </Fragment>)
                            }/>
                            <OutputEntries entries={{ DATA }}/>
                        </UserCommand>
                        <SystemReply>
                            <OutputEntries entries={{ status235, enhancedStatus270, successful }}/>
                        </SystemReply>
                        <SystemReply>
                            <OutputEntries entries={{ status250, enhancedStatus210, ok }}/>
                        </SystemReply>
                        <OutputFunction function={state =>
                            getRecipientAddresses(state).filter(address => state.mode !== 'relay' || getDomain(address) === state.domain).map(_ => <SystemReply>
                                <OutputEntries entries={{ status250, enhancedStatus215, ok }}/>
                            </SystemReply>)
                        }/>
                    </IfCase>
                    <IfCase entry="credential" value="plain" not>
                        <IfCase entry="credential" value="login">
                            <SystemReply>
                                <OutputEntries entries={{ status250, AUTH, LOGIN }}/>
                            </SystemReply>
                            <UserCommand>
                                <OutputEntries entries={{ AUTH, LOGIN }}/>
                            </UserCommand>
                            <SystemReply>
                                <OutputEntries entries={{ status334, loginUsernameChallenge }}/>
                            </SystemReply>
                            <UserCommand>
                                <OutputEntries entries={{ loginUsernameResponse }}/>
                            </UserCommand>
                            <SystemReply>
                                <OutputEntries entries={{ status334, loginPasswordChallenge }}/>
                            </SystemReply>
                            <UserCommand>
                                <OutputEntries entries={{ loginPasswordResponse }}/>
                            </UserCommand>
                        </IfCase>
                        <IfCase entry="credential" value="hashed">
                            <SystemReply>
                                <OutputEntries entries={{ status250, AUTH, CRAM_MD5 }}/>
                            </SystemReply>
                            <UserCommand>
                                <OutputEntries entries={{ AUTH, CRAM_MD5 }}/>
                            </UserCommand>
                            <SystemReply>
                                <OutputEntries entries={{ status334, challenge }}/>
                            </SystemReply>
                            <UserCommand>
                                <OutputEntries entries={{ cramMd5Response }}/>
                            </UserCommand>
                        </IfCase>
                        <SystemReply>
                            <OutputEntries entries={{ status235, enhancedStatus270, successful }}/>
                        </SystemReply>
                        <UserCommand>
                            <OutputEntries entries={{ MAIL_FROM }}/>
                            <OutputFunction function={state => angleAddress(getFromAddress(state), mailFromTitle)}/><br/>
                            <OutputFunction function={state =>
                                getRecipientAddresses(state).filter(address => state.mode !== 'relay' || getDomain(address) === state.domain).map(recipient => <Fragment>
                                    <OutputEntries entries={{ RCPT_TO }}/>
                                    <OutputFunction function={_ => angleAddress(recipient, rcptToTitle)}/><br/>
                                </Fragment>)
                            }/>
                            <OutputEntries entries={{ DATA }}/>
                        </UserCommand>
                        <SystemReply>
                            <OutputEntries entries={{ status250, enhancedStatus210, ok }}/>
                        </SystemReply>
                        <OutputFunction function={state =>
                            getRecipientAddresses(state).filter(address => state.mode !== 'relay' || getDomain(address) === state.domain).map(_ => <SystemReply>
                                <OutputEntries entries={{ status250, enhancedStatus215, ok }}/>
                            </SystemReply>)
                        }/>
                    </IfCase>
                </IfCase>
                <SystemReply>
                    <OutputEntries entries={{ status354, endData }}/>
                </SystemReply>
                <UserCommand>
                    <OutputEntries entries={{ from, to, cc }} outputSeparator={<br/>}/><br/>
                    <IfCase entry="recipients" value="onlyBcc">
                        <OutputEntries entries={{ bcc }}/><br/>
                    </IfCase>
                    <OutputEntries entries={{ subject, date, identifier, mimeVersion, contentType, contentTransferEncoding }} outputSeparator={<br/>}/><br/><br/>
                    <OutputEntries entries={{ dotStuffedBody, period, QUIT }} outputSeparator={<br/>}/>
                </UserCommand>
                <SystemReply>
                    <OutputEntries entries={{ status250, enhancedStatus200, ok }}/>
                </SystemReply>
                <SystemReply>
                    <OutputEntries entries={{ status221, enhancedStatus200, bye }}/>
                </SystemReply>
            </IfEntries>
        </CodeBlock>
    </Fragment>,
    store,
];

export const toolProtocolEsmtpClient = <Input entries={{ client }} noHistory/>;

export const esmtpMessage = <Fragment>
    <OutputEntries entries={{ from, to, cc, bcc, subject, date, identifier, mimeVersion, contentType, contentTransferEncoding }} outputSeparator={<br/>}/><br/><br/>
    <OutputEntries entries={{ body }}/><br/>
</Fragment>;

export const esmtpMessageLength = <OutputFunction function={state => {
    let length = 0;
    const headers: { [key: string]: Argument<any, State> } = { from, to, cc, bcc, subject, date, identifier, mimeVersion, contentType, contentTransferEncoding };
    for (const key of Object.keys(headers) as KeysOf<State>) {
        const entry = headers[key];
        const value = isDynamicEntry(entry) ? state[key] : normalizeToValue(entry.defaultValue, undefined);
        const output: string = entry.transform ? entry.transform(value, state) : value.toString();
        const skipped = entry.skip ? entry.skip(state, value) : !value;
        if (!skipped) {
            length += entry.longForm.length + output.length + 3; // SP + CR + LF
        }
    }
    length += encodeQuotedPrintableIfNecessary(state.body).length + 4; // 2 * (CR + LF)
    return <DynamicOutput title="Length: The length of the message in bytes.">{`{${length}}`}</DynamicOutput>;
}}/>;
