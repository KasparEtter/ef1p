/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { AnyDynamicEntry, BasicState, BasicValue, DynamicBooleanEntry, Entry } from './entry';

export interface Argument<Value extends BasicValue, State extends BasicState<State> = {}> extends Entry<Value, State> {
    longForm: string;
    shortForm?: string;
}

// A return type of 'entry is Argument<State>' does not work well because it changes TypeScript's type inference.
export function isArgument(entry: Entry<any, any> | AnyDynamicEntry<any>): boolean {
    return (entry as Argument<any, any>).longForm !== undefined;
}

export const shortForm: DynamicBooleanEntry<StateWithArguments> = {
    label: 'Short form',
    tooltip: 'Use the short form of arguments.',
    defaultValue: false,
    inputType: 'checkbox',
};

export interface StateWithArguments {
    shortForm: boolean;
}
