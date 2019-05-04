import { createElement, Fragment } from 'react';

import { Argument, Entry, isArgument, SomeEntries } from './entry';
import { StateWithTerminal } from './terminal';
import { KeysOf } from './types';

export const shortForm: Entry = {
    name: 'Short Form',
    description: 'Use the short form of arguments.',
    type: 'boolean',
    defaultValue: false,
};

export interface StateWithArguments extends StateWithTerminal {
    shortForm: boolean;
}

export function RawOutput<State extends StateWithArguments>(props: Readonly<State & SomeEntries<State>>) {
    return <Fragment>
        {(Object.keys(props.entries) as KeysOf<State>).map(key => {
            const value = props[key];
            const entry = props.entries[key]!;
            return value &&
                <Fragment
                    key={key as string}
                >
                    {' '}
                    <span
                        title={entry.name + ': ' + entry.description}
                        className="output"
                    >
                        {isArgument(entry) ? (props.shortForm ? '-' : '--') + (entry as Argument)[props.shortForm ? 'shortForm' : 'longForm'] : ''}
                        {typeof value === 'string' ? (isArgument(entry) ? ' ' : '') + value : ''}
                    </span>
                </Fragment>;
        })}
    </Fragment>;
}
