import { createElement, Fragment, ReactNode } from 'react';

import { textColor } from '../utility/color';
import { normalizeToValue } from '../utility/functions';

import { isArgument } from './argument';
import { AllEntries, getCurrentState, isDynamicEntry, PersistedState, ProvidedEntries, StateWithOnlyValues, ValueType } from './entry';
import { ProvidedStore } from './share';

export interface OutputEntriesProps {
    separator?: ReactNode; // A single space by default.
}

export function escapeValue(value: string): string {
    value = value.replace('\"', '\\\"');
    return value.includes(' ') ? `"${value}"` : value;
}

/**
 * Outputs the value of all provided entries.
 * Please note that falsy values are skipped.
 */
export function RawOutputEntries<State extends StateWithOnlyValues = {}>(props: Readonly<Partial<ProvidedStore<PersistedState<State>, AllEntries<State>>> & ProvidedEntries & OutputEntriesProps>): JSX.Element {
    const separator = props.separator ?? ' ';
    return <Fragment>
        {Object.entries(props.entries).map(([key, entry], index) => {
            // The following line errors if no store is provided for dynamic entries:
            const value: ValueType = isDynamicEntry(entry) ? getCurrentState(props.store!)[key] : normalizeToValue(entry.defaultValue, undefined);
            const details = (isDynamicEntry(entry) && entry.inputType === 'select' && entry.selectOptions) ?
                ` (${normalizeToValue(entry.selectOptions, getCurrentState(props.store!))[value as string]})` : '';
            return (!isArgument(entry) || value) &&
                <Fragment
                    key={key as string}
                >
                    {index > 0 && separator}
                    <span
                        title={entry.name + ': ' + normalizeToValue(entry.description, value) + details}
                        className={(isDynamicEntry(entry) ? 'dynamic' : 'static') + '-output' + textColor(normalizeToValue(entry.outputColor, value))}
                    >
                        {
                            isArgument(entry) ? (
                                (entry[getCurrentState(props.store!).shortForm ? 'shortForm' : 'longForm'] ?? entry.longForm) +
                                ((typeof value === 'string' || typeof value === 'number') ?
                                    ' ' + (entry.escape ? escapeValue(value.toString()) : value.toString())
                                    : ''
                                )
                            ) : (
                                value.toString()
                            )
                        }
                    </span>
                </Fragment>;
        })}
    </Fragment>;
}
