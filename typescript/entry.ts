import { KeysOf } from './types';

export interface Entry {
    name: string;
    description: string;
    type: 'boolean' | 'string' | string[];
    defaultValue: boolean | string | (() => boolean | string);
    suggestedValues?: string[];
    validate?: (value: string) => string | false;
    onChange?: () => void;
}

export interface Argument extends Entry {
    longForm: string;
    shortForm?: string;
}

export function isArgument(entry: Entry | Argument): entry is Argument {
    return (entry as Argument).longForm !== undefined;
}

export type Entries<State> = {
    [key in keyof State]: Entry | Argument;
};

export type SomeEntries<State> = {
    entries: Partial<Entries<State>>;
};

export function getDefaultValues<State>(entries: Entries<State>): State {
    const state: { [key in keyof State]?: boolean | string } = {};
    for (const key of Object.keys(entries) as KeysOf<State>) {
        const defaultValue = entries[key].defaultValue;
        state[key] = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
    return state as State;
}
