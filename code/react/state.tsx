/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Component, ComponentType, ReactNode } from 'react';

import { report } from '../utility/analytics';
import { normalizeToArray, normalizeToValue } from '../utility/normalization';
import { removeItem } from '../utility/storage';
import { decodePercent, encodePercent } from '../utility/string';
import { KeysOf, ObjectButNotFunction, ValueOrArray } from '../utility/types';

import { ArrayInputType, arrayInputTypes, BooleanInputType, booleanInputTypes, DynamicEntry, Entry, equalValues, ErrorType, NumberInputType, numberInputTypes, StringInputType, stringInputTypes, ValueType } from './entry';
import { PersistedState, PersistedStore, Store } from './store';
import { getDisplayName } from './utility';

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

export type ChangeHandler<State extends ObjectButNotFunction> = ValueOrArray<(newState: State, fromHistory: boolean) => any>;

export interface AllEntries<State extends ObjectButNotFunction> {
    readonly entries: DynamicEntries<State>;

    /**
     * The given handlers are called when any value changed, when the user pressed enter, or when the user clicked on the submit button.
     * The handlers are called only with a valid state.
     */
    readonly onChange?: ChangeHandler<State>;
}

export type VersioningEvent = 'input' | 'state';

export function getPersistedStore<State extends ObjectButNotFunction>(entries: DynamicEntries<State>, identifier: string, onChange?: ChangeHandler<State>): PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent> {
    return new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries, onChange }, identifier);
}

export function getCurrentState<State extends ObjectButNotFunction>(store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>): State {
    return store.state.states[store.state.index];
}

export function shareVersionedState<State extends ObjectButNotFunction, ProvidedProps extends ObjectButNotFunction = {}>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
) {
    return function decorator(
        WrappedComponent: ComponentType<State & ProvidedProps>,
    ) {
        return class Share extends Component<ProvidedProps & Partial<State>> {
            public static displayName = `ShareVersionedState(${getDisplayName(WrappedComponent)})`;

            public componentDidMount(): void {
                store.subscribe(this, 'state');
            }

            public componentWillUnmount(): void {
                store.unsubscribe(this, 'state');
            }

            public render(): ReactNode {
                // This order allows the parent component to override the state with properties.
                return <WrappedComponent {...getCurrentState(store)} {...this.props} />;
            }
        };
    };
}

export function shareInputs<State extends ObjectButNotFunction, ProvidedProps extends ObjectButNotFunction = {}>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
) {
    return function decorator(
        WrappedComponent: ComponentType<State & ProvidedProps>,
    ) {
        return class Share extends Component<ProvidedProps & Partial<State>> {
            public static displayName = `ShareInputs(${getDisplayName(WrappedComponent)})`;

            public componentDidMount(): void {
                store.subscribe(this, 'input');
            }

            public componentWillUnmount(): void {
                store.unsubscribe(this, 'input');
            }

            public render(): ReactNode {
                // This order allows the parent component to override the inputs with properties.
                return <WrappedComponent {...store.state.inputs} {...this.props} />;
            }
        };
    };
}

export function validateInputs<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
): void {
    const inputs = store.state.inputs;
    const entries = store.meta.entries;
    const state = getCurrentState(store);
    for (const key of Object.keys(entries) as KeysOf<State>) {
        const entry = entries[key];
        if (entry.inputType === 'number') {
            const value = inputs[key] as unknown as number;
            if (entry.minValue !== undefined && value < entry.minValue) {
                store.state.errors[key] = `This value may not be less than ${entry.minValue}.`;
                continue;
            }
            if (entry.maxValue !== undefined && value > entry.maxValue) {
                store.state.errors[key] = `This value may not be greater than ${entry.maxValue}.`;
                continue;
            }
        }
        store.state.errors[key] = entry.validate?.(inputs[key], inputs, state) ?? false;
    }
}

export function hasNoErrors<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
): boolean {
    return Object.values(store.state.errors).every(error => !error);
}

let changeCounter = 0;

function updateState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
    partialNewState: Partial<State>,
    callMetaOnChangeEvenWhenNothingChanged: boolean = false,
    partialErrors: Partial<Errors<State>> = {},
    createNewState: boolean = true,
    callChangeHandlers: boolean = true,
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
            store.update('input', 'state');
            if (callChangeHandlers) {
                changeCounter++;
                // Local copy of the change counter in case one of the handlers triggers another change synchronously.
                const changeId = changeCounter;
                for (const key of changed) {
                    normalizeToArray(entries[key].onChange).forEach(handler => handler(inputs[key], inputs, false, changeId));
                }
            }
            normalizeToArray(store.meta.onChange).forEach(handler => handler(inputs, false));
            if (createNewState) {
                report('Use tool', { Identifier: store.identifier });
            }
        } else {
            store.update('input');
            if (callMetaOnChangeEvenWhenNothingChanged) {
                normalizeToArray(store.meta.onChange).forEach(handler => handler(inputs, false));
            }
        }
    } else {
        store.update('input');
    }
}

// For state updates triggered by the user.
export function setState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
    partialNewState: Partial<State> = {},
    callMetaOnChangeEvenWhenNothingChanged: boolean = false,
): void {
    updateState(store, partialNewState, callMetaOnChangeEvenWhenNothingChanged);
}

// For state updates triggered by a change handler.
export function mergeIntoCurrentState<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
    partialNewState: Partial<State> = {},
    partialErrors: Partial<Errors<State>> = {},
    callChangeHandlers: boolean = true,
): void {
    updateState(store, partialNewState, false, partialErrors, false, callChangeHandlers);
}

function encodeValue(value: any): string {
    if (Array.isArray(value)) {
        return value.map(encodeValue).join(',');
    } else {
        return encodePercent(value.toString());
    }
}

export function encodeInputs<State extends ObjectButNotFunction>(
    entries: Partial<DynamicEntries<State>>,
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
): string[] {
    return Object.keys(entries).map(key => key + '=' + encodeValue(store.state.inputs[key as keyof State]));
}

function decodeValue(entry: DynamicEntry<any>, value: string): any {
    if (booleanInputTypes.includes(entry.inputType as BooleanInputType)) {
        if (['true', 'false'].includes(value)) {
            return value === 'true';
        }
    } else if (numberInputTypes.includes(entry.inputType as NumberInputType)) {
        if (/^-?\d+$/.test(value)) {
            const input = Number(value);
            if (entry.inputType === 'range') {
                if (input < (entry.minValue ?? 0)) {
                    return entry.minValue;
                } else if (input > (entry.maxValue ?? 100)) {
                    return entry.maxValue;
                }
            }
            return input;
        }
    } else if (stringInputTypes.includes(entry.inputType as StringInputType)) {
        const input = decodePercent(value);
        if ((entry.inputType !== 'date' || /^\d{4}-\d{2}-\d{2}$/.test(input)) && (entry.inputType !== 'color' || /^#[0-9a-f]{6}$/i.test(input))) {
            return input; // The validity of the 'select' options is checked in the updateState function.
        }
    } else if (arrayInputTypes.includes(entry.inputType as ArrayInputType)) {
        return value.split(',').map(decodePercent); // Also validated above.
    }
    return undefined;
}

export function decodeInputs<State extends ObjectButNotFunction>(
    store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>,
    parts: string[],
    submit?: (state: State) => any,
): void {
    const partialNewState: Partial<State> = {};
    for (const part of parts) {
        const index = part.indexOf('=');
        if (index > 0) {
            const key = part.substring(0, index) as keyof State;
            const value = part.substring(index + 1);
            const entry = store.meta.entries[key];
            if (entry !== undefined) {
                const input = decodeValue(entry, value);
                if (input !== undefined) {
                    partialNewState[key] = input;
                } else {
                    console.error(`Could not decode '${value}' as '${entry.inputType}'.`);
                }
            } else {
                console.error(`There is no entry for '${key}' in the store '${store.identifier}'.`);
            }
        } else {
            console.error(`Could not decode the part '${part}'.`);
        }
    }
    setState(store, partialNewState, true);
    if (submit !== undefined && hasNoErrors(store)) {
        submit(getCurrentState(store));
    }
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
