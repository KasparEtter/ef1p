import { DynamicEntry, Entry, StateWithOnlyValues, ValueType } from './entry';

export interface Argument<T extends ValueType> extends Entry<T> {
    longForm: string;
    shortForm?: string;
    escape?: boolean; // False by default.
}

export function isArgument<T extends ValueType>(entry: Entry<T>): entry is Argument<T> {
    return (entry as Argument<T>).longForm !== undefined;
}

export interface DynamicArgument<T extends ValueType> extends Argument<T>, DynamicEntry<T> {}

export const shortForm: DynamicEntry<boolean> = {
    name: 'Short form',
    description: 'Use the short form of arguments.',
    defaultValue: false,
    inputType: 'checkbox',
    labelWidth: 80,
};

export interface StateWithArguments extends StateWithOnlyValues {
    shortForm: boolean;
}
