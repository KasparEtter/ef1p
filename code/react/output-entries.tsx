/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { Color, getColorClass } from '../utility/color';
import { normalizeToValue } from '../utility/normalization';

import { Argument, isArgument, StateWithArguments } from './argument';
import { AnyDynamicEntry, BasicState, BasicValue, isDynamicEntry, outputValue, ProvidedEntries } from './entry';
import { ProvidedStore } from './store';
import { VersionedState, VersionedStore, VersioningEvent } from './versioned-store';

export interface OutputEntriesProps {
    /**
     * How adjacent outputs are separated.
     * Defaults to a single space.
     */
    readonly outputSeparator?: ReactNode;

    /**
     * How the name of an argument is separated from its value.
     * Defaults to a single space.
     */
    readonly argumentSeparator?: ReactNode;
}

/**
 * Outputs the value of all provided entries.
 * Please note that falsy values are skipped.
 */
export function RawOutputEntries<State extends BasicState<State> = {}>(props: Partial<ProvidedStore<VersionedState<State>, VersioningEvent, VersionedStore<State>>> & ProvidedEntries<State> & OutputEntriesProps): JSX.Element {
    const outputSeparator = props.outputSeparator ?? ' ';
    const argumentSeparator = props.argumentSeparator ?? ' ';
    let hasPrevious = false;
    return <Fragment>
        {Object.entries(props.entries).map(([rawKey, rawEntry]) => {
            const key = rawKey as keyof State;
            const entry = rawEntry as AnyDynamicEntry<State>;
            const state = props.store?.getCurrentState();
            // The following lines error if no store is provided for dynamic entries or static entries with skip or transform:
            const value: BasicValue = isDynamicEntry(entry) ? state![key] : normalizeToValue(entry.defaultValue, undefined);
            const output = outputValue(entry, value, state);
            const details = (isDynamicEntry(entry) && entry.inputType === 'select') ?
                ` (${normalizeToValue(entry.selectOptions, state!)[value as string]})` : '';
            const skipped = entry.skip ? entry.skip(state!, value as never) : isArgument(entry) && !value;
            if (skipped) {
                return null;
            } else {
                const result =
                    <Fragment
                        key={rawKey}
                    >
                        {hasPrevious && outputSeparator}
                        <span
                            title={entry.label + ': ' + normalizeToValue<string, any>(entry.tooltip, value) + details}
                            className={(isDynamicEntry(entry) ? 'dynamic' : 'static') + '-output' + getColorClass(normalizeToValue<Color, any>(entry.outputColor as any, value), ' ')}
                        >
                            {
                                isArgument(entry) ? (
                                    ((entry as unknown as Argument<any, State>)[(state! as unknown as StateWithArguments).shortForm ? 'shortForm' : 'longForm'] ?? (entry as unknown as Argument<any, State>).longForm) +
                                    (typeof value !== 'boolean' ? argumentSeparator + output : '')
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

export function getOutputEntries<State extends BasicState<State>>(store: VersionedStore<State>) {
    return store.injectStore<ProvidedEntries<State> & OutputEntriesProps>(RawOutputEntries, 'state');
}
