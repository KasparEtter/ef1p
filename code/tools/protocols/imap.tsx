import { Fragment } from 'react';

import { doubleQuote, reverseLookup, sortNumbers, unique } from '../../utility/functions';
import { Time } from '../../utility/time';
import { Dictionary } from '../../utility/types';

import { DynamicArgument } from '../../react/argument';
import { CodeBlock, SystemReply, UserCommand } from '../../react/code';
import { DynamicEntry, Entry } from '../../react/entry';
import { IfEntriesProps, RawIfEntries } from '../../react/if-entries';
import { InputProps, RawInput } from '../../react/input';
import { OutputEntriesProps, RawOutputEntries } from '../../react/output-entries';
import { OutputFunctionProps, RawOutputFunction } from '../../react/output-function';
import { StaticPrompt } from '../../react/prompt';
import { shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, mergeIntoCurrentState, ProvidedDynamicEntries, ProvidedEntries, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';
import { Children } from '../../react/utility';

import { findConfigurationFile, SocketType } from '../../apis/email-configuration';

import { connect, crlf, domainRegex, emailAddressRegex, esmtpMessage, esmtpMessageLength, getDomain, getUsername, implementation, openssl, quiet } from './esmtp';

/* ------------------------------ Entry updates ------------------------------ */

function updatePort(_: string, state: State, fromHistory: boolean): void {
    if (fromHistory) {
        return;
    }
    if (state.security === 'implicit') {
        mergeIntoCurrentState(store, { 'port': 993 });
    } else {
        mergeIntoCurrentState(store, { 'port': 143 });
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
        mergeIntoCurrentState(store, { 'server': 'imap.' + domain });
    } else {
        const configuration = await findConfigurationFile(domain, [], true);
        const imapServers = (configuration?.incomingServers ?? []).filter(server => server.type === 'imap');
        if (imapServers.length > 0) {
            const desiredServer = imapServers.filter(server => server.socket === socketTypeLookup[security]);
            const server = desiredServer.length > 0 ? desiredServer[0] : imapServers[0];
            lastSecurity = reverseLookup(socketTypeLookup, server.socket) ?? 'implicit';
            mergeIntoCurrentState(store, {
                'security': lastSecurity,
                'server': server.host,
                'port': parseInt(server.port, 10),
                'username': server.username === '%EMAILLOCALPART%' ? 'local' : 'full',
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
    labelWidth: 63,
    inputWidth,
    validate: value => !emailAddressRegex.test(value) && 'Please enter a single email address.',
    transform: (value, state) => getUsername(state.username, value),
    onChange: updateServer,
};

const password: DynamicEntry<string, State> = {
    name: 'Password',
    description: 'The password of your account. I recommend you to set up a test account for this.',
    defaultValue: 'password',
    inputType: 'password',
    labelWidth: 73,
    inputWidth,
};

const security: DynamicEntry<string, State> = {
    name: 'Security',
    description: 'Select which variant of TLS you want to use.',
    defaultValue: 'implicit',
    inputType: 'select',
    labelWidth: 63,
    selectOptions: {
        implicit: 'Implicit TLS',
        explicit: 'Explicit TLS',
    },
    onChange: [updatePort, updateServer],
};

const server: DynamicEntry<string, State> = {
    name: 'Server',
    description: 'The server to connect to. The server is determined automatically if possible but you can also set it manually.',
    defaultValue: 'imap.example.org',
    inputType: 'text',
    labelWidth: 51,
    inputWidth,
    validate: value => !domainRegex.test(value) && 'Please enter a domain name in the preferred name syntax.',
};

const port: DynamicEntry<number, State> = {
    name: 'Port',
    description: 'The port number of the server. The port number is determined automatically but you can also set the value manually.',
    defaultValue: 993,
    inputType: 'number',
    labelWidth: 36,
    inputWidth: inputWidth / 2,
    minValue: 1,
    maxValue: 65535,
    suggestedValues: [143, 993],
    validate: value => (value < 1 || value > 65535) && 'The port has to be a number between 1 and 65535.',
};

const username: DynamicEntry<string, State> = {
    name: 'Username',
    description: 'Select how to determine the username for authentication.',
    defaultValue: 'full',
    inputType: 'select',
    labelWidth: 77,
    selectOptions: {
        full: 'Full address',
        local: 'Local part',
    },
};

const list: DynamicEntry<boolean, State> = {
    name: 'List',
    description: 'Whether to list all folders.',
    defaultValue: false,
    inputType: 'checkbox',
    labelWidth: 30,
};

const write: DynamicEntry<boolean, State> = {
    name: 'Write',
    description: 'Whether to allow modifications to the selected folder.',
    defaultValue: false,
    inputType: 'checkbox',
    labelWidth: 46,
};

const fetch: DynamicEntry<string, State> = {
    name: 'Fetch',
    description: 'Select what you want to fetch.',
    defaultValue: '(BODY[])',
    inputType: 'select',
    labelWidth: 44,
    selectOptions: {
        'INTERNALDATE': 'Date',
        'FLAGS': 'Flags',
        'BODY.PEEK[HEADER]': 'Header',
        'BODY[]': 'Message',
        'BODY.PEEK[HEADER.FIELDS (SUBJECT)]': 'Subject',
        'BODY[TEXT]': 'Text',
    },
};

const search: DynamicArgument<boolean, State> = {
    name: 'Search',
    description: 'Whether to fetch (and delete) the search result instead of the specified messages.',
    defaultValue: false,
    inputType: 'checkbox',
    labelWidth: 53,
    longForm: 'ESEARCH SEARCHRES',
};

const messageSetRegex = /^(\d+|\*)(\:(\d+|\*))?(,(\d+|\*)(\:(\d+|\*))?)*$/;

function validateMessageNumbers(messageSet: string): boolean {
    return messageSet
        .split(/[,\:]/)
        .filter(value => value !== '*')
        .map(value => Number.parseInt(value, 10))
        .every(value => value > 0 && value < 4294967296);
}

const messages: DynamicEntry<string, State> = {
    name: 'Messages',
    description: 'The message numbers you want to fetch. Examples: "4", "6:8", "4,6:8", or "1:*".',
    defaultValue: '4',
    inputType: 'text',
    labelWidth: 74,
    inputWidth: inputWidth / 2,
    disable: ({ search }) => search,
    validate: value =>
        !messageSetRegex.test(value) && 'Please enter a valid message set.' ||
        !validateMessageNumbers(value) && `Every number has to be between 0 and 4'294'967'296.`,
    transform: (value, { search }) => search ? '$' : value,
};

function getHighestMessageNumber(state: State): number {
    return Math.max(...state.messages.split(/[,\:]/).map(value => value === '*' ? 1 : Number.parseInt(value, 10)));
}

function getAllMessageNumbers(state: State): string[] {
    if (state.search) {
        return ['$'];
    } else if (state.messages.includes('*')) {
        return ['?'];
    } else {
        const result: number[] = [];
        const sequences = state.messages.split(',');
        for (const sequence of sequences) {
            const parts = sequence.split(':').map(value => Number.parseInt(value, 10));
            const value1 = parts[0];
            const value2 = parts[parts.length - 1];
            const smallerValue = Math.min(value1, value2);
            const largerValue = Math.max(value1, value2);
            for (let i = smallerValue; i <= largerValue; i++) {
                result.push(i);
            }
        }
        return sortNumbers(unique(result)).map(value => value.toString());
    }
}

interface Criterion {
    name: string;
    value?: boolean;
    date?: boolean;
}

const criteria: { [key: string]: Criterion } = {
    ANSWERED: {
        name: 'Answered',
    },
    SINCE: {
        name: 'After',
        date: true,
    },
    BCC: {
        name: 'Bcc',
        value: true,
    },
    BEFORE: {
        name: 'Before',
        date: true,
    },
    BODY: {
        name: 'Body',
        value: true,
    },
    CC: {
        name: 'Cc',
        value: true,
    },
    FLAGGED: {
        name: 'Flagged',
    },
    FROM: {
        name: 'From',
        value: true,
    },
    ON: {
        name: 'On',
        date: true,
    },
    SUBJECT: {
        name: 'Subject',
        value: true,
    },
    TEXT: {
        name: 'Text',
        value: true,
    },
    TO: {
        name: 'To',
        value: true,
    },
    UNSEEN: {
        name: 'Unread',
    },
};

const selectOptions: Record<string, string> = {};
for (const key of Object.keys(criteria)) {
    selectOptions[key] = criteria[key].name;
}

const criterion: DynamicEntry<string, State> = {
    name: 'Criterion',
    description: 'Select the criteria you want to search for.',
    defaultValue: 'SUBJECT',
    inputType: 'select',
    labelWidth: 69,
    selectOptions,
    disable: ({ search }) => !search,
};

const value: DynamicEntry<string, State> = {
    name: 'Value',
    description: 'The value you want to search for.',
    defaultValue: '',
    inputType: 'text',
    labelWidth: 44,
    inputWidth,
    disable: ({ search, criterion }) => !search || !criteria[criterion].value,
    skip: ({ criterion }) => !criteria[criterion].value,
    transform: doubleQuote, // Escaping double quotes with a backslash seems to work.
};

const months: { [key: string]: string | undefined } = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
}

function toImapFormat(YYYY_MM_DD: string): string {
    const parts = YYYY_MM_DD.split('-');
    return Number.parseInt(parts[2], 10).toString() + '-' + (months[parts[1]] ?? 'Jan') + '-' + parts[0];
}

const date: DynamicEntry<string, State> = {
    name: 'Date',
    description: 'The date you want to search for.',
    defaultValue: Time.current().toLocalTime().toGregorianDate(),
    inputType: 'date',
    labelWidth: 40,
    disable: ({ search, criterion }) => !search || !criteria[criterion].date,
    skip: ({ criterion }) => !criteria[criterion].date,
    transform: toImapFormat,
};

const deletion: DynamicEntry<boolean, State> = {
    name: 'Delete',
    description: 'Whether to delete the fetched message on the server.',
    defaultValue: false,
    inputType: 'checkbox',
    labelWidth: 52,
    disable: ({ write }) => !write,
};

const append: DynamicEntry<boolean, State> = {
    name: 'Append',
    description: 'Whether to add a message to the selected folder.',
    defaultValue: false,
    inputType: 'checkbox',
    labelWidth: 60,
    disable: ({ write }) => !write,
};

const idle: DynamicArgument<boolean, State> = {
    name: 'Idle',
    description: 'Whether to listen for changes to the selected folder.',
    defaultValue: false,
    inputType: 'checkbox',
    labelWidth: 31,
    longForm: 'IDLE',
};

interface State {
    address: string;
    password: string;
    security: string;
    server: string;
    port: number;
    username: string;
    list: boolean;
    write: boolean;
    fetch: string;
    search: boolean;
    messages: string;
    criterion: string;
    value: string;
    date: string;
    deletion: boolean;
    append: boolean;
    idle: boolean;
}

const entries: DynamicEntries<State> = {
    address,
    password,
    security,
    server,
    port,
    username,
    list,
    write,
    fetch,
    search,
    messages,
    criterion,
    value,
    date,
    deletion,
    append,
    idle,
};

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'protocol-imap');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);
const OutputEntries = shareStore<VersionedState<State>, ProvidedEntries & OutputEntriesProps, AllEntries<State>, VersioningEvent>(store, 'state')(RawOutputEntries);
const OutputFunction = shareStore<VersionedState<State>, OutputFunctionProps<State>, AllEntries<State>, VersioningEvent>(store, 'state')(RawOutputFunction);
const IfEntries = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & IfEntriesProps & Children, AllEntries<State>, VersioningEvent>(store, 'state')(RawIfEntries);

/* ------------------------------ Tag entries ------------------------------ */

function tag(value: string): Entry<string> {
    return {
        name: 'Tag',
        description: 'A unique tag to match the command with its response.',
        defaultValue: value,
    };
};

const tagI = tag('I');
const tagC = tag('C');
const tagL = tag('L');
const tagE = tag('E');
const tagS = tag('S');
const tagF = tag('F');
const tagD = tag('D');
const tagX = tag('X');
const tagA = tag('A');
const tagW = tag('W');
const tagO = tag('O');

/* ------------------------------ Openssl entries ------------------------------ */

const starttls: Entry<string, State> = {
    name: 'Option',
    description: 'Send the IMAP-specific command sequence to start TLS for the rest of the communication.',
    defaultValue: '-starttls imap',
    skip: state => state.security !== 'explicit',
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
    defaultValue: 'completed',
};

const asterisk: Entry<string> = {
    name: 'Asterisk',
    description: 'This marks a server response.',
    defaultValue: '*',
};

const ready: Entry<string> = {
    name: 'Description',
    description: 'An optional text for human users.',
    defaultValue: 'ready',
};

/* ------------------------------ Login entries ------------------------------ */

const LOGIN: Entry<string> = {
    name: 'Command',
    description: 'The command to log in as the user whose messages you would like to retrieve.',
    defaultValue: 'LOGIN',
};

/* ------------------------------ Capability entries ------------------------------ */

const CAPABILITY: Entry<string> = {
    name: 'Command',
    description: 'The command to list the supported capabilities.',
    defaultValue: 'CAPABILITY',
};

const IMAP4rev1: Entry<string> = {
    name: 'Capability',
    description: 'This capability has to be part of the list.',
    defaultValue: 'IMAP4rev1',
};

/* ------------------------------ List entries ------------------------------ */

const LIST: Entry<string> = {
    name: 'Command',
    description: 'The command to list all folders matching the given pattern in the given context.',
    defaultValue: 'LIST',
};

const context: Entry<string> = {
    name: 'Context',
    description: 'The context can be used to restrict the returned folders as a path prefix.',
    defaultValue: '""',
};

const pattern: Entry<string> = {
    name: 'Pattern',
    description: 'The pattern can be used to filter the returned folders based on its path.',
    defaultValue: '"*"',
};

const hasNoChildren: Entry<string> = {
    name: 'Attribute',
    description: 'This attribute indicates that the folder at the end of the line has no children.',
    defaultValue: '\\HasNoChildren',
};

function attribute(value: string): Entry<string> {
    return {
        name: 'Attribute',
        description: 'This attributes marks the role of the folder so that mail clients can recognize it independent of the potentially internationalized folder name.',
        defaultValue: value,
    };
};

const all = attribute('\\All');
const sent = attribute('\\Sent');
const drafts = attribute('\\Drafts');
const trash = attribute('\\Trash');
const junk = attribute('\\Junk');

const delimiter: Entry<string> = {
    name: 'Delimiter',
    description: 'The delimiter used to separate folder names in the hierarchy.',
    defaultValue: '"/"',
};

const INBOX: Entry<string> = {
    name: 'Folder',
    description: '"INBOX" is a special name reserved for the primary folder of the user.',
    defaultValue: '"INBOX"',
};

function folder(value: string): Entry<string> {
    return {
        name: 'Folder',
        description: 'The absolute name of this folder.',
        defaultValue: '"' + value + '"',
    };
};

const allFolder = folder('All Mail');
const sentFolder = folder('Sent Mail');
const draftsFolder = folder('Drafts');
const trashFolder = folder('Trash');
const spamFolder = folder('Spam');

/* ------------------------------ Select entries ------------------------------ */

const EXAMINE: Entry<string, State> = {
    name: 'Command',
    description: 'The command to open the given folder in read-only mode.',
    defaultValue: 'EXAMINE',
    skip: state => state.write,
};

const READ_ONLY: Entry<string, State> = {
    name: 'Permissions',
    description: 'The folder has been opened in read-only mode.',
    defaultValue: '[READ-ONLY]',
    skip: state => state.write,
};

const SELECT: Entry<string, State> = {
    name: 'Command',
    description: 'The command to open the given folder in read-write mode.',
    defaultValue: 'SELECT',
    skip: state => !state.write,
};

const READ_WRITE: Entry<string, State> = {
    name: 'Permissions',
    description: 'The folder has been opened in read-write mode (i.e. you can write to the folder).',
    defaultValue: '[READ-WRITE]',
    skip: state => !state.write,
};

const EXISTS: Entry<string, State> = {
    name: 'Information',
    description: 'The number of messages in the folder. Make sure that your folder has at least as many messages. Otherwise, the following commands might fail.',
    defaultValue: '',
    transform: (_, state) => `${getHighestMessageNumber(state)} EXISTS`,
};

const numberOfUnseenMessages = 2;

const RECENT: Entry<string> = {
    name: 'Information',
    description: `The number of messages which haven't yet been retrieved by a client (and thus still have the \\Recent flag).`,
    defaultValue: `${numberOfUnseenMessages} RECENT`,
};

const UNSEEN: Entry<string, State> = {
    name: 'Information',
    description: `The sequence number of the first message, which hasn't been seen/read yet (and thus doesn't have the \\Seen flag yet).`,
    defaultValue: '',
    transform: (_, state) => `[UNSEEN ${getHighestMessageNumber(state) - numberOfUnseenMessages + 1}]`,
};

const UIDNEXT: Entry<string, State> = {
    name: 'Information',
    description: `The unique identifier (UID) which will be applied to the next message.`,
    defaultValue: '',
    transform: (_, state) => `[UIDNEXT ${getHighestMessageNumber(state) + 1}]`,
};

const UIDVALIDITY: Entry<string> = {
    name: 'Information',
    description: `The client has to erase its identifier to message mapping if this value changes.`,
    defaultValue: '[UIDVALIDITY 1]',
};

const PERMANENTFLAGS: Entry<string, State> = {
    name: 'Information',
    description: `The flags that the client can change permanently. The list is empty when examining the folder in read-only mode.`,
    defaultValue: '',
    transform: (_, { write }) => `[PERMANENTFLAGS (${write ? '\\Answered \\Flagged \\Deleted \\Seen \\Draft \\*' : ''})]`,
};

const FLAGS: Entry<string> = {
    name: 'Information',
    description: `The flags which are defined in the folder.`,
    defaultValue: 'FLAGS (\\Answered \\Flagged \\Deleted \\Seen \\Draft)',
};

/* ------------------------------ Search entries ------------------------------ */

const SEARCH: Entry<string> = {
    name: 'Command',
    description: 'The command to open the given folder in read-only mode.',
    defaultValue: 'SEARCH',
};

const RETURN_SAVE: Entry<string> = {
    name: 'Option',
    description: 'RFC 5182 introduced an option to save the search result for later use with $. In order to use this, SEARCHRES has to be one of the supported capabilities.',
    defaultValue: 'RETURN (SAVE)',
};

/* ------------------------------ Fetch entries ------------------------------ */

const FETCH: Entry<string> = {
    name: 'Command',
    description: 'The command to fetch the specified messages or the search result.',
    defaultValue: 'FETCH',
};

const length: Entry<string> = {
    name: 'Length',
    description: 'The length of the data in bytes with newlines counting as two (CR+LF).',
    defaultValue: '{<Length>}',
};

const data: Entry<string> = {
    name: 'Data',
    description: 'This is just a placeholder for the actual data.',
    defaultValue: '<Data>',
};

/* ------------------------------ Delete entries ------------------------------ */

const STORE: Entry<string> = {
    name: 'Command',
    description: 'The command to add or remove flags from the specified messages.',
    defaultValue: 'STORE',
};

const ADD_FLAGS: Entry<string> = {
    name: 'Option',
    description: 'Add the given flags to the specified messages.',
    defaultValue: '+FLAGS',
};

const deleted: Entry<string> = {
    name: 'Flags',
    description: 'The list of flags to add to the specified messages.',
    defaultValue: '(\\Deleted)',
};

const newFlags: Entry<string> = {
    name: 'Flags',
    description: 'The list of flags that the given message now has.',
    defaultValue: '(FLAGS (\\Deleted \\Seen))',
};

const EXPUNGE: Entry<string> = {
    name: 'Command',
    description: 'The command to permanently delete all messages marked as deleted in the folder.',
    defaultValue: 'EXPUNGE',
};

const expungeExists: Entry<string, State> = {
    name: 'Update',
    description: 'The server informs the client about the new number of messages in the folder.',
    defaultValue: '',
    transform: (_, state) => `${getHighestMessageNumber(state) - getAllMessageNumbers(state).length} EXISTS`,
};

/* ------------------------------ Append entries ------------------------------ */

const APPEND: Entry<string> = {
    name: 'Command',
    description: 'The command to add the given message to the specified folder.',
    defaultValue: 'APPEND',
};

const appendFlags: Entry<string> = {
    name: 'Flags (optional)',
    description: 'Flags to set on the appended message.',
    defaultValue: '(\\Seen)',
};

const goAhead: Entry<string> = {
    name: 'Response',
    description: 'The server indicates that it is ready to receive the message.',
    defaultValue: '+ go ahead',
};

const appendExists: Entry<string, State> = {
    name: 'Update',
    description: 'The server informs the client about the new number of messages in the folder.',
    defaultValue: '',
    transform: (_, state) => `${getHighestMessageNumber(state) - (state.deletion ? getAllMessageNumbers(state).length : 0) + 1} EXISTS`,
};

/* ------------------------------ Idle entries ------------------------------ */

const IDLE: Entry<string> = {
    name: 'Command',
    description: 'The command to ….',
    defaultValue: 'IDLE',
};

const idling: Entry<string> = {
    name: 'Response',
    description: 'The server indicates that it will notify the client about changes to the folder.',
    defaultValue: '+ idling',
};

const timePassesMessageArrived: Entry<string> = {
    name: 'Meta',
    description: 'This is not part of the protocol.',
    defaultValue: '[Time passes and a new message arrives.]',
};

const messageArrived: Entry<string, State> = {
    name: 'Update',
    description: 'The server informs the client that a new message arrived by providing the new number of messages.',
    defaultValue: '',
    transform: (_, state) => `${getHighestMessageNumber(state) - (state.deletion ? getAllMessageNumbers(state).length : 0) + (state.append ? 1 : 0) + 1} EXISTS`,
};

const timePassesMessageDeleted: Entry<string> = {
    name: 'Meta',
    description: 'This is not part of the protocol.',
    defaultValue: '[Time passes and another client deletes the first message.]',
};

const messageDeleted: Entry<string> = {
    name: 'Update',
    description: 'The server informs the client that another client deleted the first message.',
    defaultValue: '1 EXPUNGE',
};

const messageTotal: Entry<string, State> = {
    name: 'Update',
    description: 'The server informs the client that there are now three messages in the folder.',
    defaultValue: '',
    transform: (_, state) => `${getHighestMessageNumber(state) - (state.deletion ? getAllMessageNumbers(state).length : 0) + (state.append ? 1 : 0)} EXISTS`,
};

const timePassesClientLogout: Entry<string> = {
    name: 'Meta',
    description: 'This is not part of the protocol.',
    defaultValue: '[Time passes and the client wants to log out.]',
};

const DONE: Entry<string> = {
    name: 'Command',
    description: 'The command to stop idling.',
    defaultValue: 'DONE',
};

const terminated: Entry<string> = {
    name: 'Description',
    description: 'An optional text for human users.',
    defaultValue: 'terminated',
};

/* ------------------------------ Logout entries ------------------------------ */

const LOGOUT: Entry<string> = {
    name: 'Option',
    description: 'The command to log out and let the server close the network connection.',
    defaultValue: 'LOGOUT',
};

const BYE: Entry<string> = {
    name: 'Status response',
    description: 'The status response to announce that the server is going to close the connection.',
    defaultValue: 'BYE',
};

const loggingOut: Entry<string> = {
    name: 'Description',
    description: 'An optional text for human users.',
    defaultValue: 'Logging out',
};

/* ------------------------------ User interface ------------------------------ */

function entry(value: string): Entry<string> {
    return {
        name: 'Message number',
        description: value === '$' ?
                'Instead of the dollar sign, you get this response for each message which matched your search query.'
            :
                (value === '?' ?
                    'Instead of the question mark, you get this response for each message in your set.'
                :
                    'The sequence number of the message to which the response belongs.'
                ),
        defaultValue: value,
    };
}

export const toolProtocolImap = <Fragment>
    <Input entries={entries} newColumnAt={9}/>
    <CodeBlock>
        <StaticPrompt>
            <OutputEntries entries={{ openssl, quiet, crlf, starttls, connect, server }}/>:<OutputEntries entries={{ port }}/>
        </StaticPrompt>
        <SystemReply>
            <OutputEntries entries={{ asterisk, OK, implementation, ready }}/>
        </SystemReply>
        <UserCommand>
            <OutputEntries entries={{ tagI, LOGIN, address, password }}/>
        </UserCommand>
        <SystemReply>
            <OutputEntries entries={{ tagI, OK, LOGIN, completed }}/>
        </SystemReply>
        <IfEntries entries={{ search, idle }} or>
            <UserCommand>
                <OutputEntries entries={{ tagC, CAPABILITY }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ asterisk, CAPABILITY, IMAP4rev1, search, idle }}/><br/>
                <OutputEntries entries={{ tagC, OK, CAPABILITY, completed }}/>
            </SystemReply>
        </IfEntries>
        <IfEntries entries={{ list }}>
            <UserCommand>
                <OutputEntries entries={{ tagL, LIST, context, pattern }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ asterisk, LIST }}/> (<OutputEntries entries={{ hasNoChildren }}/>) <OutputEntries entries={{ delimiter, INBOX }}/><br/>
                <OutputEntries entries={{ asterisk, LIST }}/> (<OutputEntries entries={{ hasNoChildren, all }}/>) <OutputEntries entries={{ delimiter, allFolder }}/><br/>
                <OutputEntries entries={{ asterisk, LIST }}/> (<OutputEntries entries={{ hasNoChildren, sent }}/>) <OutputEntries entries={{ delimiter, sentFolder }}/><br/>
                <OutputEntries entries={{ asterisk, LIST }}/> (<OutputEntries entries={{ hasNoChildren, drafts }}/>) <OutputEntries entries={{ delimiter, draftsFolder }}/><br/>
                <OutputEntries entries={{ asterisk, LIST }}/> (<OutputEntries entries={{ hasNoChildren, trash }}/>) <OutputEntries entries={{ delimiter, trashFolder }}/><br/>
                <OutputEntries entries={{ asterisk, LIST }}/> (<OutputEntries entries={{ hasNoChildren, junk }}/>) <OutputEntries entries={{ delimiter, spamFolder }}/><br/>
                <OutputEntries entries={{ tagL, OK, LIST, completed }}/>
            </SystemReply>
        </IfEntries>
        <UserCommand>
            <OutputEntries entries={{ tagE, EXAMINE, SELECT, INBOX }}/>
        </UserCommand>
        <SystemReply>
            <OutputEntries entries={{ asterisk, EXISTS }}/><br/>
            <OutputEntries entries={{ asterisk, RECENT }}/><br/>
            <OutputEntries entries={{ asterisk, OK, UNSEEN }}/><br/>
            <OutputEntries entries={{ asterisk, OK, UIDNEXT }}/><br/>
            <OutputEntries entries={{ asterisk, OK, UIDVALIDITY }}/><br/>
            <OutputEntries entries={{ asterisk, OK, PERMANENTFLAGS }}/><br/>
            <OutputEntries entries={{ asterisk, FLAGS }}/><br/>
            <OutputEntries entries={{ tagE, OK, READ_ONLY, READ_WRITE, EXAMINE, SELECT, completed }}/>
        </SystemReply>
        <IfEntries entries={{ search }}>
            <UserCommand>
                <OutputEntries entries={{ tagS, SEARCH, RETURN_SAVE, criterion, value, date }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ tagS, OK, SEARCH, completed }}/>
            </SystemReply>
        </IfEntries>
        <UserCommand>
            <OutputEntries entries={{ tagF, FETCH, messages }}/> (<OutputEntries entries={{ fetch }}/>)
        </UserCommand>
        <SystemReply>
            <OutputFunction function={state =>
                ['INTERNALDATE', 'FLAGS'].includes(state.fetch) ?
                    getAllMessageNumbers(state).map(value => <Fragment>
                        <OutputEntries entries={{ asterisk, e: entry(value), FETCH }}/> (<OutputEntries entries={{ fetch, data }}/>)<br/>
                    </Fragment>)
                :
                    getAllMessageNumbers(state).map(value => <Fragment>
                        <OutputEntries entries={{ asterisk, e: entry(value), FETCH }}/> (<OutputEntries entries={{ fetch, length }}/><br/>
                        <OutputEntries entries={{ data }}/><br/>)<br/>
                    </Fragment>)
            }/>
            <OutputEntries entries={{ tagF, OK, FETCH, completed }}/>
        </SystemReply>
        <IfEntries entries={{ write, deletion }}>
            <UserCommand>
                <OutputEntries entries={{ tagD, STORE, messages, ADD_FLAGS, deleted }}/>
            </UserCommand>
            <SystemReply>
                <OutputFunction function={state =>
                    getAllMessageNumbers(state).map(value => <Fragment>
                        <OutputEntries entries={{ asterisk, e: entry(value), FETCH, newFlags }}/><br/>
                    </Fragment>)
                }/>
                <OutputEntries entries={{ tagD, OK, STORE, completed }}/>
            </SystemReply>
            <UserCommand>
                <OutputEntries entries={{ tagX, EXPUNGE }}/>
            </UserCommand>
            <SystemReply>
                <OutputFunction function={state =>
                    getAllMessageNumbers(state).map(value => <Fragment>
                        <OutputEntries entries={{ asterisk, e: entry(value), EXPUNGE }}/><br/>
                    </Fragment>)
                }/>
                <OutputEntries entries={{ asterisk, expungeExists }}/><br/>
                <OutputEntries entries={{ tagX, OK, EXPUNGE, completed }}/>
            </SystemReply>
        </IfEntries>
        <IfEntries entries={{ write, append }}>
            <UserCommand>
                <OutputEntries entries={{ tagA, APPEND, INBOX, appendFlags }}/> {esmtpMessageLength}
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ goAhead }}/>
            </SystemReply>
            <UserCommand>
                {esmtpMessage}
            </UserCommand><br/>
            <SystemReply>
                <OutputEntries entries={{ asterisk, appendExists }}/><br/>
                <OutputEntries entries={{ tagA, OK, APPEND, completed }}/>
            </SystemReply>
        </IfEntries>
        <IfEntries entries={{ idle }}>
            <UserCommand>
                <OutputEntries entries={{ tagW, IDLE }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ idling }}/><br/>
                <OutputEntries entries={{ timePassesMessageArrived }}/><br/>
                <OutputEntries entries={{ asterisk, messageArrived }}/><br/>
                <OutputEntries entries={{ timePassesMessageDeleted }}/><br/>
                <OutputEntries entries={{ asterisk, messageDeleted }}/><br/>
                <OutputEntries entries={{ asterisk, messageTotal }}/><br/>
                <OutputEntries entries={{ timePassesClientLogout }}/>
            </SystemReply>
            <UserCommand>
                <OutputEntries entries={{ DONE }}/>
            </UserCommand>
            <SystemReply>
                <OutputEntries entries={{ tagW, OK, IDLE, terminated }}/>
            </SystemReply>
        </IfEntries>
        <UserCommand>
            <OutputEntries entries={{ tagO, LOGOUT }}/>
        </UserCommand>
        <SystemReply>
            <OutputEntries entries={{ asterisk, BYE, loggingOut }}/><br/>
            <OutputEntries entries={{ tagO, OK, LOGOUT, completed }}/>
        </SystemReply>
    </CodeBlock>
</Fragment>;
