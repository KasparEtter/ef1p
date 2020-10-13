import { report } from '../utility/analytics';
import { Color } from '../utility/color';
import { normalizeToArray, normalizeToValue } from '../utility/functions';
import { Function, KeysOf, ValueOrArray, ValueOrFunction } from '../utility/types';

import { PersistedStore, Store } from './store';

export type ValueType = boolean | number | string;
export type ErrorType = string | false;

/**
 * Static entries can only be used to output information to the user.
 */
export interface Entry<T extends ValueType> {
    readonly name: string;
    readonly description: ValueOrFunction<string, T>;
    defaultValue: ValueOrFunction<T>;
    outputColor?: ValueOrFunction<Color, T>;
}

export type Entries = {
    readonly [key: string]: Entry<any>;
};

export interface ProvidedEntries {
    // Entries cannot be an array as we need the keys to access the associated state.
    // This also mean that you cannot have the same entry more than once in the same output.
    readonly entries: Entries;
}

export const booleanInputTypes = ['checkbox', 'switch'] as const;
export type BooleanInputType = typeof booleanInputTypes[number];

export const numberInputTypes = ['number', 'range'] as const;
export type NumberInputType = typeof numberInputTypes[number];

export const stringInputTypes = ['text', 'textarea', 'select', 'password', 'date', 'color'] as const;
export type StringInputType = typeof stringInputTypes[number];

export type InputType = BooleanInputType | NumberInputType | StringInputType;

/**
 * 'text' and 'number' provide suggestions based on their history.
 */
export const inputTypesWithHistory: InputType[] = ['text', 'number'];

/**
 * Dynamic entries can be input by the user and thus have an associated state.
 */
export interface DynamicEntry<T extends ValueType, State extends StateWithOnlyValues = {}> extends Entry<T> {
    readonly inputType: InputType;
    /**
     * Width in pixels.
     */
    readonly labelWidth: number;
    /**
     * Width in pixels.
     */
    readonly inputWidth?: number;
    /**
     * Only relevant for 'textarea' inputs.
     */
    readonly rows?: number;
    readonly minValue?: T;
    readonly maxValue?: T;
    readonly stepValue?: T;
    readonly placeholder?: ValueOrFunction<string, State>;
    /**
     * The suggested values are added to the datalist but not to the history.
     */
    readonly suggestedValues?: ValueOrFunction<T[], State>;
    /**
     * Only relevant for 'select' inputs.
     */
    readonly selectOptions?: ValueOrFunction<Record<string, string>, State>;
    readonly disabled?: Function<boolean, State>;
    readonly validate?: (value: T, state: State) => ErrorType;
    /**
     * Only use onChange for reactions specific to this entry.
     * Otherwise use the meta property of the store.
     *
     * @argument fromHistory Derived entries shouldn't be overwritten when stepping through the history.
     * @argument changeId This value allows callees to determine that the same change triggered several invocations of the same handler.
     */
    readonly onChange?: ValueOrArray<(newValue: T, newState: State, fromHistory: boolean, changeId: number) => any>;
    /**
     * For live updates based on the current input.
     * You likely also want to listen for changes as onInput is not triggered when stepping through the history.
     * Also note that the value has not been validated and that onInput is not triggered for boolean and 'select' inputs.
     */
    readonly onInput?: ValueOrArray<(newValue: T, currentState: State) => any>;
    readonly determine?: Function<Promise<[T, ErrorType]>, State>;
}

export function isDynamicEntry<T extends ValueType>(entry: Entry<T>): entry is DynamicEntry<T> {
    return (entry as DynamicEntry<T>).inputType !== undefined;
}

export interface StateWithOnlyValues {
    [key: string]: ValueType;
    [key: number]: never;
}

export type DynamicEntries<State extends StateWithOnlyValues> = {
    readonly [key in keyof State]: DynamicEntry<any, State>;
};

export interface ProvidedDynamicEntries<State extends StateWithOnlyValues> {
    readonly entries: Partial<DynamicEntries<State>>;
}

export function getDefaultState<State extends StateWithOnlyValues>(entries: DynamicEntries<State>): State {
    const state: StateWithOnlyValues = {};
    for (const key of Object.keys(entries) as KeysOf<State>) {
        state[key as string] = normalizeToValue(entries[key].defaultValue, undefined);
    }
    return state as State;
}

export type Errors<State extends StateWithOnlyValues> = {
    [key in keyof State]: ErrorType;
};

export interface PersistedState<State extends StateWithOnlyValues> {
    states: State[];
    inputs: State;
    errors: Errors<State>;
    index: number;
}

export function getNoErrors<State extends StateWithOnlyValues>(entries: DynamicEntries<State>): Errors<State> {
    const errors: { [key: string]: false } = {};
    for (const key of Object.keys(entries) as KeysOf<State>) {
        errors[key as string] = false;
    }
    return errors as Errors<State>;
}

export function getDefaultPersistedState<State extends StateWithOnlyValues>(entries: DynamicEntries<State>): PersistedState<State> {
    const state = getDefaultState(entries);
    return {
        states: [ state ],
        inputs: { ...state }, // It's important to use a copy here.
        errors: getNoErrors(entries),
        index: 0,
    };
}

export interface AllEntries<State extends StateWithOnlyValues> {
    readonly entries: DynamicEntries<State>;
    /**
     * There is no more specific 'onSubmit' callback
     * because pressing enter would trigger both 'onChange' and 'onSubmit'.
     * Since the caller might want to trigger the same action in either case but only once,
     * it's easier if we guarantee a single invocation here.
     */
    readonly onChange?: ValueOrArray<(newState: State, fromHistory: boolean) => any>;
}

export function getCurrentState<State extends StateWithOnlyValues>(store: Store<PersistedState<State>, AllEntries<State>>): State {
    return store.state.states[store.state.index];
}

let changeCounter = 0;

function updateState<State extends StateWithOnlyValues>(
    store: Store<PersistedState<State>, AllEntries<State>>,
    partialNewState: Partial<State>,
    callOnChangeEvenWhenNoChange: boolean = false,
    partialErrors: Partial<Errors<State>> = {},
    createNewState: boolean = true,
): void {
    const inputs = { ...store.state.inputs, ...partialNewState };
    store.state.inputs = inputs;
    const entries = store.meta.entries;
    for (const key of Object.keys(partialNewState) as KeysOf<State>) {
        store.state.errors[key] = entries[key].validate?.(partialNewState[key] as string, inputs) ?? false;
    }
    store.state.errors = { ...store.state.errors, ...partialErrors };
    if (Object.values(store.state.errors).every(error => !error)) {
        const changed: (keyof State)[] = [];
        const currentState = getCurrentState(store);
        // We need to loop through all inputs and not just through the partial state
        // because an input could have been changed while another input had an error.
        // Now that other inputs are disabled, this can only happen programmatically.
        for (const key of Object.keys(entries) as KeysOf<State>) {
            if (inputs[key] !== currentState[key]) {
                changed.push(key);
            }
        }
        if (changed.length > 0) {
            // Go through all the select entries and change their value
            // if it's no longer in the list of select options when computed with the new state.
            for (const key of Object.keys(entries) as KeysOf<State>) {
                if (entries[key].inputType === 'select') {
                    const newSelectOptions = Object.keys(normalizeToValue(entries[key].selectOptions!, inputs));
                    if (newSelectOptions.length === 0) {
                        throw new Error('There should always be at least one option to select.');
                    }
                    if (!newSelectOptions.includes(inputs[key] as string)) {
                        store.state.inputs[key] = newSelectOptions[0] as any;
                        inputs[key] = newSelectOptions[0] as any;
                        changed.push(key);
                    }
                }
            }
            // Insert the new state into the array of states.
            if (createNewState) {
                store.state.index += 1;
                store.state.states.splice(store.state.index, 0, { ...inputs });
            } else {
                store.state.states[store.state.index] = { ...inputs };
            }
        }
        store.update();
        changeCounter++;
        // Local copy of the change counter in case one of the handlers triggers another change synchronously.
        const changeId = changeCounter;
        for (const key of changed) {
            normalizeToArray(entries[key].onChange).forEach(handler => handler(inputs[key], inputs, false, changeId));
        }
        if (changed.length > 0 || callOnChangeEvenWhenNoChange) {
            normalizeToArray(store.meta.onChange).forEach(handler => handler(inputs, false));
        }
        if (changed.length > 0 && createNewState) {
            const label = (store as PersistedStore<PersistedState<State>, AllEntries<State>>).identifier ?? 'unknown';
            report('tools', 'state', label);
        }
    } else {
        store.update();
    }
}

// For state updates triggered by the user.
export function setState<State extends StateWithOnlyValues>(
    store: Store<PersistedState<State>, AllEntries<State>>,
    partialNewState: Partial<State>,
    callOnChangeEvenWhenNoChange: boolean = false,
): void {
    updateState(store, partialNewState, callOnChangeEvenWhenNoChange);
}

// For state updates triggered by a change handler.
export function mergeIntoCurrentState<State extends StateWithOnlyValues>(
    store: Store<PersistedState<State>, AllEntries<State>>,
    partialNewState: Partial<State>,
    partialErrors: Partial<Errors<State>> = {},
): void {
    updateState(store, partialNewState, false, partialErrors, false);
}

function changeState<State extends StateWithOnlyValues>(
    store: Store<PersistedState<State>, AllEntries<State>>,
    nextIndex: number,
    clear?: boolean,
): void {
    const entries = store.meta.entries;
    const previousState = getCurrentState(store);
    store.state.index = nextIndex;
    const nextState = getCurrentState(store);
    store.state.inputs = { ...nextState };
    store.state.errors = getNoErrors(entries);
    if (clear) {
        store.state.states.splice(1);
    }
    store.update();
    changeCounter++;
    // Local copy of the change counter in case one of the handlers triggers another change synchronously.
    const changeId = changeCounter;
    for (const key of Object.keys(entries) as KeysOf<State>) {
        if (nextState[key] !== previousState[key]) {
            normalizeToArray(entries[key].onChange).forEach(handler => handler(nextState[key], nextState, true, changeId));
        }
    }
    normalizeToArray(store.meta.onChange).forEach(handler => handler(nextState, true));
}

export function previousState<State extends StateWithOnlyValues>(
    store: Store<PersistedState<State>, AllEntries<State>>,
): void {
    if (store.state.index === 0) {
        console.warn('There is no previous state.');
    } else {
        changeState(store, store.state.index - 1);
    }
}

export function nextState<State extends StateWithOnlyValues>(
    store: Store<PersistedState<State>, AllEntries<State>>,
): void {
    if (store.state.index === store.state.states.length - 1) {
        console.warn('There is no next state.');
    } else {
        changeState(store, store.state.index + 1);
    }
}

export function clearState<State extends StateWithOnlyValues>(
    store: Store<PersistedState<State>, AllEntries<State>>,
): void {
    if (store.state.states.length === 1) {
        console.warn('There is no state to clear.');
    } else {
        changeState(store, 0, true);
    }
}
