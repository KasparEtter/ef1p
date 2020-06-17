import { Color } from '../utility/color';
import { KeysOf } from '../utility/types';

import { newValue, newValueWithHistory, Value, ValueType } from './value';

/**
 * Static entries can only be used to output information to the user.
 */
export interface Entry<T extends ValueType> {
    name: string;
    description: string;
    defaultValue: T;
    outputColor?: Color;
}

export type Entries = {
    [key: string]: Entry<any>;
};

export interface ProvidedEntries {
    // Entries cannot be an array as we need the keys to access the associated state.
    // This also mean that you cannot have the same entry more than once in the same output.
    entries: Entries;
}

export const booleanInputTypes = ['checkbox', 'switch'] as const;
export type BooleanInputType = typeof booleanInputTypes[number];

export const numberInputTypes = ['number', 'range'] as const;
export type NumberInputType = typeof numberInputTypes[number];

export const stringInputTypes = ['text', 'select', 'password', 'date', 'color'] as const;
export type StringInputType = typeof stringInputTypes[number];

export type InputType = BooleanInputType | NumberInputType | StringInputType;

/**
 * 'text' and 'number' maintain a history.
 */
export const inputTypesWithHistory: InputType[] = ['text', 'number'];

/**
 * Dynamic entries can be input by the user and thus have an associated state.
 */
export interface DynamicEntry<T extends ValueType> extends Entry<T> {
    inputType: InputType;
    labelWidth: number; // In pixels.
    inputWidth?: number; // In pixels.
    minValue?: T;
    maxValue?: T;
    stepValue?: T;
    suggestedValues?: T[] | (() => T[]); // Added to the datalist but not the history.
    selectOptions?: Record<string, string>; // Only relevant for 'select' inputs.
    disabled?: () => boolean;
    validate?: (value: T) => (string | false);
    onChange?: () => void | (() => void)[]; // Can be used to trigger, for example, API requests.
}

export function isDynamicEntry<T extends ValueType>(entry: Entry<T>): entry is DynamicEntry<T> {
    return (entry as DynamicEntry<T>).inputType !== undefined;
}

export interface StateWithOnlyValues {
    [key: string]: Value<any>;
}

export type DynamicEntries<State extends StateWithOnlyValues> = {
    [key in keyof State]: DynamicEntry<any>;
};

export interface ProvidedDynamicEntries<State extends StateWithOnlyValues> {
    entries: Partial<DynamicEntries<State>>;
}

export function getDefaultValues<State extends StateWithOnlyValues>(entries: DynamicEntries<State>): State {
    const state: StateWithOnlyValues = {};
    for (const key of Object.keys(entries) as KeysOf<State>) {
        state[key as string] = (inputTypesWithHistory.includes(entries[key].inputType) ? newValueWithHistory : newValue)(entries[key].defaultValue);
    }
    return state as State;
}
