import { createElement, Fragment } from 'react';

import { textColor } from '../utility/color';

import { isArgument } from './argument';
import { InputType, isDynamicEntry, ProvidedEntries, StateWithOnlyValues } from './entry';
import { ProvidedStore } from './share';

export interface RawOutputProps {
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
export function RawOutput(props: Readonly<Partial<ProvidedStore<StateWithOnlyValues>> & ProvidedEntries & RawOutputProps>): JSX.Element {
    const separator = props.separator ?? ' ';
    return <Fragment>
        {Object.entries(props.entries).map(([key, entry], index) => {
            // The following line errors if no store is provided for dynamic entries or the key does not exist:
            const value: InputType = isDynamicEntry(entry) ? props.store!.state[key].value : entry.defaultValue;
            const details = isDynamicEntry(entry) && entry.inputType === 'select' && entry.selectOptions ? ` (${entry.selectOptions[value]})` : '';
            return value &&
                <Fragment
                    key={key as string}
                >
                    {index > 0 && separator}
                    <span
                        title={entry.name + ': ' + entry.description + details}
                        className={(isDynamicEntry(entry) ? 'dynamic' : 'static') + '-output' + textColor(entry.outputColor, ' ')}
                    >
                        {/* The following line errors if the state of the provided store has no 'shortForm' property for arguments: */}
                        {isArgument(entry) && (
                            entry[props.store!.state.shortForm!.value ? 'shortForm' : 'longForm'] ?? entry.longForm
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
