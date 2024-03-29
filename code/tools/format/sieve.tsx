/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { doubleQuote } from '../../utility/string';

import { CodeBlock } from '../../react/code';
import { ClickToCopy } from '../../react/copy';
import { DynamicBooleanEntry, DynamicEntries, DynamicSingleSelectEntry, DynamicTextEntry, Entry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const inputWidth = 260;

const condition: DynamicSingleSelectEntry<State> = {
    label: 'Condition',
    tooltip: 'Under what condition the action shall be executed.',
    defaultValue: 'Subject',
    inputType: 'select',
    selectOptions: {
        From: 'From',
        To: 'To',
        Cc: 'Cc',
        Subject: 'Subject',
        Body: 'Body',
        Always: 'Always',
    },
    transform: value => {
        switch (value) {
            case 'From':
                return 'address';
            case 'To':
                return 'address';
            case 'Cc':
                return 'address';
            case 'Subject':
                return 'header';
            case 'Body':
                return 'body';
            case 'Always':
                return 'true';
            default:
                console.error('Unknown Sieve condition:', value);
                return 'ERROR';
        }
    },
};

const addressPart: DynamicSingleSelectEntry<State> = {
    label: 'Address part',
    tooltip: 'Which part of the address shall be matched.',
    defaultValue: 'all',
    inputType: 'select',
    selectOptions: {
        all: 'Whole address',
        localpart: 'Local part',
        domain: 'Domain part',
    },
    transform: value => ':' + value,
    skip: ({ condition }) => ['Subject', 'Body', 'Always'].includes(condition),
    disable: ({ condition }) => ['Subject', 'Body', 'Always'].includes(condition),
};

const matchType: DynamicSingleSelectEntry<State> = {
    label: 'Match type',
    tooltip: 'How the field has to match the value.',
    defaultValue: 'contains',
    inputType: 'select',
    selectOptions: {
        contains: 'Contains',
        beginsWith: 'Begins with',
        endsWith: 'Ends with',
        isEqualTo: 'Is equal to',
        matches: 'Matches',
    },
    transform: value => {
        switch (value) {
            case 'contains':
                return ':contains';
            case 'beginsWith':
                return ':matches';
            case 'endsWith':
                return ':matches';
            case 'isEqualTo':
                return ':is';
            case 'matches':
                return ':matches';
            default:
                console.error('Unknown Sieve match type:', value);
                return 'ERROR';
        }
    },
    skip: ({ condition }) => condition === 'Always',
    disable: ({ condition }) => condition === 'Always',
};

function ifAlways(state: State): boolean {
    return state.condition === 'Always';
}

// Escaping backslashes and double quotes is correct:
// https://datatracker.ietf.org/doc/html/rfc5228#section-2.4.2
const value: DynamicTextEntry<State> = {
    label: 'Value',
    tooltip: 'The value to match the selected field.',
    defaultValue: 'Test',
    inputType: 'text',
    inputWidth,
    transform: (value, { matchType }) =>
        matchType === 'beginsWith' ?
            doubleQuote(value + '*')
        : (
            matchType === 'endsWith' ?
                doubleQuote('*' + value)
            :
                doubleQuote(value)
        ),
    skip: ifAlways,
    disable: ifAlways,
};

const negation: DynamicBooleanEntry<State> = {
    label: 'Negation',
    tooltip: 'Whether to negate the condition.',
    defaultValue: false,
    inputType: 'checkbox',
    transform: () => 'not',
    skip: ({ condition }, value) => condition === 'Always' || !value,
    disable: ifAlways,
};

const action: DynamicSingleSelectEntry<State> = {
    label: 'Action',
    tooltip: 'What you want to do with the messages which satisfy the condition.',
    defaultValue: 'addflag',
    inputType: 'select',
    selectOptions: {
        fileinto: 'Move',
        redirect: 'Forward',
        discard: 'Delete',
        addflag: 'Flag',
        vacation: 'Reply',
    },
};

// Escaping backslashes and double quotes is correct:
// https://datatracker.ietf.org/doc/html/rfc5228#section-2.4.2
const argument: DynamicTextEntry<State> = {
    label: 'Argument',
    tooltip: 'The argument to the chosen action.',
    defaultValue: '\\Seen',
    inputType: 'text',
    inputWidth,
    transform: doubleQuote,
    skip: ({ action }) => action === 'discard',
    disable: ({ action }) => action === 'discard',
};

interface State {
    condition: string;
    addressPart: string;
    matchType: string;
    value: string;
    negation: boolean;
    action: string;
    argument: string;
}

const entries: DynamicEntries<State> = {
    condition,
    addressPart,
    matchType,
    value,
    negation,
    action,
    argument,
};

const store = new VersionedStore(entries, 'format-sieve');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);

/* ------------------------------ Output ------------------------------ */

function getExtensions(state: State): string[] {
    const extensions: string[] = [];
    if (state.condition === 'Body') {
        extensions.push('body');
    }
    if (state.action === 'fileinto') {
        extensions.push('fileinto');
    }
    if (state.action === 'addflag') {
        extensions.push('imap4flags');
    }
    if (state.action === 'vacation') {
        extensions.push('vacation');
    }
    return extensions;
}

const _require: Entry<string, State> = {
    label: 'Extensions',
    tooltip: `Declaration of the extensions which are required by this script.`,
    defaultValue: '',
    transform: (_, state) => {
        const extensions = getExtensions(state).map(doubleQuote);
        if (extensions.length === 1) {
            return `require ${extensions[0]};\n`;
        } else {
            return `require [${extensions.join(', ')}];\n`;
        }
    },
    skip: state => getExtensions(state).length === 0,
};

const _if: Entry<string, State> = {
    label: 'Control command',
    tooltip: `The action in the curly brackets is only executed if the condition is true.`,
    defaultValue: 'if',
};

const field: Entry<string, State> = {
    label: 'Field',
    tooltip: `The name of the field whose value has to match the provided value.`,
    defaultValue: '',
    transform: (_, { condition }) => doubleQuote(condition),
    skip: ({ condition }) => ['Body', 'Always'].includes(condition),
};

/* ------------------------------ Tool ------------------------------ */

export const toolFormatSieve: Tool = [
    <Fragment>
        <Input inColumns/>
        <CodeBlock>
            <ClickToCopy newline>
                <OutputEntries entries={{ _require }}/>
                <OutputEntries entries={{ _if, negation, condition, addressPart, matchType, field, value }}/> {'{'}<br/>
                {'    '}<OutputEntries entries={{ action, argument }}/>;<br/>
                {'}'}
            </ClickToCopy>
        </CodeBlock>
    </Fragment>,
    store,
];
