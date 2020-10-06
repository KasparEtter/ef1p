import { createElement, Fragment } from 'react';

import { textColor } from '../utility/color';
import { normalizeToValue } from '../utility/functions';

import { isArgument } from './argument';
import { AllEntries, getCurrentState, InputType, isDynamicEntry, PersistedState, ProvidedEntries, StateWithOnlyValues } from './entry';
import { ProvidedStore } from './share';

export interface OutputEntriesProps {
    separator?: string; // Single space by default.
    noEscaping?: boolean; // False by default.
}

export function escapeValue(value: string): string {
    value = value.replace('\"', '\\\"');
    return value.includes(' ') ? '"' + value + '"' : value;
}

/**
 * Outputs the value of all provided entries.
 * Please note that falsy values are skipped.
 */
export function RawOutputEntries<State extends StateWithOnlyValues>(props: Readonly<Partial<ProvidedStore<PersistedState<State>, AllEntries<State>>> & ProvidedEntries & OutputEntriesProps>): JSX.Element {
    const separator = props.separator ?? ' ';
    return <Fragment>
        {Object.entries(props.entries).map(([key, entry], index) => {
            // The following line errors if no store is provided for dynamic entries or the key does not exist:
            const state = getCurrentState(props.store!);
            const value: InputType = isDynamicEntry(entry) ? state[key] : entry.defaultValue;
            const details = isDynamicEntry(entry) && entry.inputType === 'select' && entry.selectOptions ? ` (${normalizeToValue(entry.selectOptions, state)[value]})` : '';
            return value &&
                <Fragment
                    key={key as string}
                >
                    {index > 0 && separator}
                    <span
                        title={entry.name + ': ' + entry.description + details}
                        className={(isDynamicEntry(entry) ? 'dynamic' : 'static') + '-output' + textColor(entry.outputColor)}
                    >
                        {isArgument(entry) && (
                            // The following line errors if the state of the provided store has no 'shortForm' property for arguments:
                            entry[getCurrentState(props.store!).shortForm! ? 'shortForm' : 'longForm'] ?? entry.longForm
                        )}
                        {(typeof value === 'string' || typeof value === 'number') && (
                            (isArgument(entry) ? ' ' : '') +
                            (props.noEscaping ? value : escapeValue(value.toString()))
                        )}
                    </span>
                </Fragment>;
        })}
    </Fragment>;
}
