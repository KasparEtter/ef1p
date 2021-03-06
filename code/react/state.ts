import { report } from '../utility/analytics';
import { normalizeToArray, normalizeToValue } from '../utility/functions';
import { removeItem } from '../utility/storage';
import { KeysOf, ObjectButNotFunction, ValueOrArray } from '../utility/types';

import { DynamicEntry, Entry, equalValues, ErrorType, ValueType } from './entry';
import { PersistedState, Store } from './store';

export type Entries = {
    readonly [key: string]: Entry<any, any>;
};

export interface ProvidedEntries {
    // Entries cannot be an array as we need the keys to access the associated state.
    // This also mean that you cannot have the same entry more than once in the same output.
    readonly entries: Entries;
}

export type DynamicEntries<State extends ObjectButNotFunction> = {
    readonly [key in keyof State]: DynamicEntry<any, State>;
};

export interface ProvidedDynamicEntries<State extends ObjectButNotFunction> {
    readonly entries: Partial<DynamicEntries<State>>;
}

export function getDefaultState<State extends ObjectButNotFunction>(entries: DynamicEntries<State>): State {
    const state: { [key: string]: ValueType } = {};
    for (const key of Object.keys(entries) as KeysOf<State>) {
        state[key as string] = normalizeToValue(entries[key].defaultValue, undefined);
    }
    return state as State;
}

export type Errors<State extends ObjectButNotFunction> = {
    [key in keyof State]: ErrorType;
};

export interface VersionedState<State extends ObjectButNotFunction> extends PersistedState<VersioningEvent> {
    states: State[];
    inputs: State;
    errors: Errors<State>;
    index: number;
}

function getNoErrors<State extends ObjectButNotFunction>(entries: DynamicEntries<State>): Errors<State> {
    const errors: { [key: string]: false } = {};
    for (const key of Object.keys(entries) as KeysOf<State>) {
        errors[key as string] = false;
    }
    return errors as Errors<State>;
}

export function getDefaultVersionedState<State extends ObjectButNotFunction>(entries: DynamicEntries<State>): VersionedState<State> {
    const state = getDefaultState(entries);
    return {
        states: [ state ],
        inputs: { ...state }, // It's important to use a copy here. Since all values are primitive, a shallow copy is good enough.
        errors: getNoErrors(entries),
        index: 0,
    };
}

export interface AllEntries<State extends ObjectButNotFunction> {
    readonly entries: DynamicEntries<State>;

    /**
     * There is no more specific 'onSubmit' callback
     * because pressing enter would trigger both 'onChange' and 'onSubmit'.
     * Since the caller might want to trigger the same action in either case but only once,
     * it's easier if we guarantee a single invocation here.
     */
    readonly onChange?: ValueOrArray<(newState: State, fromHistory: boolean) => any>;
}

export type VersioningEvent = 'input' | 'state';

export function getCurrentState<State extends ObjectButNotFunction>(store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>): State {
    return store.state.states[store.state.index];
}

let changeCounter = 0;

export function validateInputs<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
): void {
    const inputs = store.state.inputs;
    const entries = store.meta.entries;
    for (const key of Object.keys(entries) as KeysOf<State>) {
        store.state.errors[key] = entries[key].validate?.(inputs[key], inputs) ?? false;
    }
}

export function hasNoErrors<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
): boolean {
    return Object.values(store.state.errors).every(error => !error);
}

function updateState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
    partialNewState: Partial<State>,
    callOnChangeEvenWhenNoChange: boolean = false,
    partialErrors: Partial<Errors<State>> = {},
    createNewState: boolean = true,
): void {
    const inputs = { ...store.state.inputs, ...partialNewState };
    store.state.inputs = inputs;
    validateInputs(store);
    store.state.errors = { ...store.state.errors, ...partialErrors };
    if (hasNoErrors(store)) {
        const entries = store.meta.entries;
        const changed: (keyof State)[] = [];
        const currentState = getCurrentState(store);
        // We need to loop through all inputs and not just through the partial state
        // because an input could have been changed while another input had an error.
        // Now that other inputs are disabled, this can only happen programmatically.
        for (const key of Object.keys(entries) as KeysOf<State>) {
            if (!equalValues(inputs[key], currentState[key])) {
                changed.push(key);
            }
        }
        if (changed.length > 0) {
            // Go through all the select entries and change their value
            // if it's no longer in the list of select options when computed with the new state.
            for (const key of Object.keys(entries) as KeysOf<State>) {
                if (['select', 'multiple'].includes(entries[key].inputType)) {
                    const newSelectOptions = Object.keys(normalizeToValue(entries[key].selectOptions!, inputs));
                    if (newSelectOptions.length === 0) {
                        throw new Error('There should always be at least one option to select.');
                    }
                    if (entries[key].inputType === 'select') {
                        if (!newSelectOptions.includes(inputs[key] as any)) {
                            store.state.inputs[key] = newSelectOptions[0] as any;
                            inputs[key] = newSelectOptions[0] as any;
                            changed.push(key);
                        }
                    } else if (entries[key].inputType === 'multiple') {
                        const input = inputs[key] as unknown as string[];
                        const filteredInput = input.filter(value => newSelectOptions.includes(value));
                        if (!equalValues(input, filteredInput)) {
                            store.state.inputs[key] = filteredInput as any;
                            inputs[key] = filteredInput as any;
                            changed.push(key);
                        }
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
        store.update('input', 'state');
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
            report('tools', 'state', store.identifier);
        }
    } else {
        store.update('input');
    }
}

// For state updates triggered by the user.
export function setState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
    partialNewState: Partial<State> = {},
    callOnChangeEvenWhenNoChange: boolean = false,
): void {
    updateState(store, partialNewState, callOnChangeEvenWhenNoChange);
}

// For state updates triggered by a change handler.
export function mergeIntoCurrentState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
    partialNewState: Partial<State> = {},
    partialErrors: Partial<Errors<State>> = {},
): void {
    updateState(store, partialNewState, false, partialErrors, false);
}

export function clearErrors<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
): void {
    const errors = store.state.errors;
    for (const key of Object.keys(errors) as KeysOf<State>) {
        errors[key] = false;
    }
}

function changeState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
    nextIndex: number,
): void {
    const entries = store.meta.entries;
    const previousState = getCurrentState(store);
    store.state.index = nextIndex;
    const nextState = getCurrentState(store);
    store.state.inputs = { ...nextState };
    clearErrors(store);
    store.update('input', 'state');
    changeCounter++;
    // Local copy of the change counter in case one of the handlers triggers another change synchronously.
    const changeId = changeCounter;
    for (const key of Object.keys(entries) as KeysOf<State>) {
        if (!equalValues(nextState[key], previousState[key])) {
            normalizeToArray(entries[key].onChange).forEach(handler => handler(nextState[key], nextState, true, changeId));
        }
    }
    normalizeToArray(store.meta.onChange).forEach(handler => handler(nextState, true));
}

export function previousState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
): void {
    if (store.state.index === 0) {
        console.warn('There is no previous state.');
    } else {
        changeState(store, store.state.index - 1);
    }
}

export function nextState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
): void {
    if (store.state.index === store.state.states.length - 1) {
        console.warn('There is no next state.');
    } else {
        changeState(store, store.state.index + 1);
    }
}

export function clearState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
): void {
    if (store.state.states.length === 1) {
        console.warn('There is no state to clear.');
    } else {
        removeItem(store.identifier);
    }
}
