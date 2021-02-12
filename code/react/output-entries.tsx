import { Fragment, ReactNode } from 'react';

import { textColor } from '../utility/color';
import { normalizeToValue } from '../utility/functions';
import { ObjectButNotFunction } from '../utility/types';

import { isArgument } from './argument';
import { isDynamicEntry, ValueType } from './entry';
import { ProvidedStore } from './share';
import { AllEntries, getCurrentState, ProvidedEntries, VersionedState, VersioningEvent } from './state';

export interface OutputEntriesProps {
    separator?: ReactNode; // A single space by default.
}

/**
 * Outputs the value of all provided entries.
 * Please note that falsy values are skipped.
 */
export function RawOutputEntries<State extends ObjectButNotFunction = {}>(props: Readonly<Partial<ProvidedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>> & ProvidedEntries & OutputEntriesProps>): JSX.Element {
    const separator = props.separator ?? ' ';
    let hasPrevious = false;
    return <Fragment>
        {Object.entries(props.entries).map(([key, entry]) => {
            // The following lines error if no store is provided for dynamic entries or static entries with skip or transform:
            // @ts-ignore
            const value: ValueType = isDynamicEntry(entry) ? getCurrentState(props.store!)[key] : normalizeToValue(entry.defaultValue, undefined);
            const output: string = entry.transform ? entry.transform(value, getCurrentState(props.store!)) : value.toString();
            const details = (isDynamicEntry(entry) && entry.inputType === 'select' && entry.selectOptions) ?
                ` (${normalizeToValue(entry.selectOptions, getCurrentState(props.store!))[value as string]})` : '';
            const skipped = entry.skip ? entry.skip(getCurrentState(props.store!), value) : isArgument(entry) && !value;
            if (skipped) {
                return null;
            } else {
                const result =
                    <Fragment
                        key={key as string}
                    >
                        {hasPrevious && separator}
                        <span
                            title={entry.name + ': ' + normalizeToValue(entry.description, value) + details}
                            className={(isDynamicEntry(entry) ? 'dynamic' : 'static') + '-output' + textColor(normalizeToValue(entry.outputColor, value))}
                        >
                            {
                                isArgument(entry) ? (
                                    // @ts-ignore
                                    (entry[getCurrentState(props.store!).shortForm ? 'shortForm' : 'longForm'] ?? entry.longForm) +
                                    (typeof value === 'boolean' ? '' : ' ' + output)
                                ) : (
                                    output
                                )
                            }
                        </span>
                    </Fragment>;
                hasPrevious = true;
                return result;
            }
        })}
    </Fragment>;
}
