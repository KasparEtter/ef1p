import { ObjectButNotFunction } from '../utility/types';

import { DynamicEntry, Entry, ValueType } from './entry';

export interface Argument<T extends ValueType, State extends ObjectButNotFunction = {}> extends Entry<T, State> {
    longForm: string;
    shortForm?: string;
}

export function isArgument<T extends ValueType>(entry: Entry<T>): entry is Argument<T> {
    return (entry as Argument<T>).longForm !== undefined;
}

export interface DynamicArgument<T extends ValueType, State extends ObjectButNotFunction = {}> extends Argument<T, State>, DynamicEntry<T, State> {}

export const shortForm: DynamicEntry<boolean> = {
    name: 'Short form',
    description: 'Use the short form of arguments.',
    defaultValue: false,
    inputType: 'checkbox',
    labelWidth: 80,
};

export interface StateWithArguments {
    shortForm: boolean;
}
