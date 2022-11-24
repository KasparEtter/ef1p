/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Component, ComponentType, ReactNode } from 'react';

import { report } from '../utility/analytics';
import { getErrorMessage } from '../utility/error';
import { normalizeToArray, normalizeToValue } from '../utility/normalization';
import { filterUndefinedValues } from '../utility/object';
import { KeysOf, MissingOrUndefined, ObjectButNotFunction } from '../utility/types';

import { AnyDynamicEntry, BasicState, BasicValue, decodeBasicValue, DynamicEntries, encodeBasicValue, equalValues, Errors, InputError, validateBoundaries, validateIndependently } from './entry';
import { PersistedState, PersistedStore } from './persisted-store';
import { getDisplayName } from './utility';

export type VersioningEvent = 'input' | 'state';

export type ErrorIsDependent<State extends BasicState<State>> = {
    [key in keyof State]: boolean;
};

export interface VersionedState<State extends BasicState<State>> extends PersistedState<VersioningEvent> {
    inputs: State;
    lastValidatedInputs: State;
    errors: Errors<State>;
    errorIsDependent: ErrorIsDependent<State>;
    states: State[];
    index: number;
}

export function getDefaultState<State extends BasicState<State>>(entries: DynamicEntries<State>): State {
    const state: { [key: string]: BasicValue } = {};
    for (const key of Object.keys(entries) as unknown as KeysOf<State>) {
        state[key as string] = normalizeToValue(entries[key].defaultValue, undefined);
    }
    return state as State;
}

type FalseForEachKey<State extends BasicState<State>> = {
    [key in keyof State]: false;
};

function getFalseForEachKey<State extends BasicState<State>>(state: State): FalseForEachKey<State>;
function getFalseForEachKey<State extends BasicState<State>>(state: Partial<State>): Partial<FalseForEachKey<State>>;

function getFalseForEachKey<State extends BasicState<State>>(state: Partial<State>): Partial<FalseForEachKey<State>> {
    const errors: Partial<FalseForEachKey<State>> = {};
    for (const key of Object.keys(state) as unknown as KeysOf<State>) {
        errors[key] = false;
    }
    return errors;
}

function getDefaultVersionedState<State extends BasicState<State>>(entries: DynamicEntries<State>): VersionedState<State> {
    const state = getDefaultState(entries);
    return {
        inputs: state,
        lastValidatedInputs: state,
        errors: getFalseForEachKey(state),
        errorIsDependent: getFalseForEachKey(state),
        states: [ state ],
        index: 0,
    };
}

/**
 * This class versions the state shared among components.
 */
export class VersionedStore<State extends BasicState<State>> extends PersistedStore<VersionedState<State>, VersioningEvent> {
    /**
     * Creates a new versioned store with the given entries, identifier, and handler.
     * The 'onChange' handler is called for changes caused by returning to a previous state or by advancing to a new state in any window.
     * The 'onChange' handler is also called when the user pressed enter or clicked on the submit button.
     * The old state is the same as the new state when the user pressed enter with no changes or clicked on the submit button.
     * The 'onChange' handler is called only with valid states.
     */
    public constructor(
        public readonly entries: DynamicEntries<State>,
        identifier: string,
        public readonly onChange?: (newState: Readonly<State>, oldState: Readonly<State>) => any,
        renamedEntries?: string[],
    ) {
        super(
            getDefaultVersionedState(entries),
            identifier,
            renamedEntries === undefined ? undefined : state => renamedEntries.some(renamedEntry => state.inputs.hasOwnProperty(renamedEntry)),
        );
    }

    protected onStateChange(
        newVersionedState: Readonly<VersionedState<State>>,
        oldVersionedState: Readonly<VersionedState<State>>,
    ): void {
        if (newVersionedState.index !== oldVersionedState.index) { // The change could also be in the inputs.
            this.onChange?.(newVersionedState.states[newVersionedState.index], oldVersionedState.states[oldVersionedState.index]);
        }
    }

    public setState(partialNewState?: Readonly<Partial<VersionedState<State>>>, ...events: VersioningEvent[]): void {
        throw new Error('versioned-store.tsx: You cannot set the state of a versioned store directly.');
    }

    /**
     * Returns the current state of this store.
     * The state object may not be mutated.
     */
    public getCurrentState(): Readonly<State> {
        return this.state.states[this.state.index];
    }

    /**
     * Returns the inputs of this versioned store.
     * The inputs object may not be mutated.
     */
    public getInputs(): Readonly<State> {
        return this.state.inputs;
    }

    /**
     * Returns the errors of this versioned store.
     * The errors object may not be mutated.
     */
    public getErrors(): Readonly<Errors<State>> {
        return this.state.errors;
    }

    /**
     * Returns the keys of this versioned store.
     */
    public getKeys(): KeysOf<State> {
        return Object.keys(this.entries) as unknown as KeysOf<State>;
    }

    /**
     * Returns whether the inputs have no errors.
     */
    public hasNoErrors(): boolean {
        return this.getKeys().every(key => !this.state.errors[key]);
    }

    /**
     * Returns whether the inputs have independent errors.
     */
    public hasIndependentErrors(): boolean {
        return this.getKeys().some(key => !this.state.errorIsDependent[key] && this.state.errors[key]);
    }

    /**
     * Returns whether the inputs have dependent errors.
     */
    public hasDependentErrors(): boolean {
        return this.getKeys().some(key => this.state.errorIsDependent[key] && this.state.errors[key]);
    }

    /**
     * Sets an input of this versioned state.
     */
    public setInput(
        key: keyof State,
        input: BasicValue,
        skipUpdate = false,
    ): void {
        if (!equalValues(input, this.getInputs()[key])) {
            const inputs: State = { ...this.getInputs(), [key]: input };
            const errors: Errors<State> = { ...this.getErrors(), [key]: false };
            // errorIsDependent does not need to be updated in this method as all changed inputs are validated independently again anyway.
            const entry = this.entries[key];
            const updateOtherInputsOnInput = entry.updateOtherInputsOnInput;
            const triggerOtherInputOnInput = entry.triggerOtherInputOnInput;
            if (updateOtherInputsOnInput || triggerOtherInputOnInput || entry.validateIndependentlyOnInput) {
                const error = validateIndependently(entry, input, inputs);
                if (error) {
                    errors[key] = error;
                } else {
                    if (updateOtherInputsOnInput !== undefined) {
                        try {
                            const partialNewInputs = updateOtherInputsOnInput(input as never, inputs, errors);
                            Object.assign(inputs, partialNewInputs);
                            Object.assign(errors, getFalseForEachKey(partialNewInputs));
                        } catch (error) {
                            errors[key] = getErrorMessage(error);
                        }
                    }
                    if (triggerOtherInputOnInput !== undefined) {
                        const otherKey = normalizeToValue(triggerOtherInputOnInput, inputs);
                        const otherEntry = this.entries[otherKey];
                        const otherInput = inputs[otherKey];
                        const otherError = validateIndependently(otherEntry, otherInput, inputs);
                        if (otherError) {
                            errors[otherKey] = otherError;
                        } else {
                            try {
                                const partialNewInputs = otherEntry.updateOtherInputsOnInput!(otherInput as never, inputs, errors);
                                Object.assign(inputs, partialNewInputs);
                                Object.assign(errors, getFalseForEachKey(partialNewInputs));
                            } catch (error) {
                                errors[otherKey] = getErrorMessage(error);
                            }
                        }
                    }
                }
            }
            super.setState({
                inputs,
                errors,
            }, ...(skipUpdate ? [] : ['input' as VersioningEvent]));
        }
    }

    /**
     * Sets an error of this versioned state.
     */
    public setError(
        key: keyof State,
        error: InputError,
        dependent: boolean = false,
        skipUpdate = false,
    ): void {
        super.setState({
            errors: { ...this.getErrors(), [key]: error },
            errorIsDependent: { ...this.state.errorIsDependent, [key]: dependent }, // The error should be resettable only by changing the input.
        }, ...(skipUpdate ? [] : ['input' as VersioningEvent]));
    }

    /**
     * Sets a new state based on the current inputs.
     */
    public async setNewStateFromCurrentInputs(): Promise<void> {
        this.setNewStateFromCurrentInputsInternally();
    }

    protected async setNewStateFromCurrentInputsInternally(
        callOnChangeEvenWhenNothingChanged: boolean = false,
        triggerUpdates: boolean = true,
    ): Promise<void> {
        const inputs: State = { ...this.getInputs() };
        const lastValidatedInputs = this.state.lastValidatedInputs;
        const changes = new Set<keyof State>();
        for (const key of this.getKeys()) {
            if (!equalValues(inputs[key], lastValidatedInputs[key])) {
                changes.add(key);
            }
        }
        if (changes.size > 0) {
            const errors: Errors<State> = { ...this.getErrors() };
            const errorIsDependent: ErrorIsDependent<State> = { ...this.state.errorIsDependent };
            // Validate the changed values independently.
            for (const key of changes) {
                errors[key] = validateIndependently(this.entries[key], inputs[key], inputs);
                errorIsDependent[key] = false;
            }
            // Validate the values of all entries whose dependencies changed and are valid.
            // Also update the select options and derive values during the same iteration.
            for (const key of this.getKeys()) {
                const entry = this.entries[key];
                const valueChanged = changes.has(key);
                const dependencies = normalizeToArray(entry.dependencies);
                const dependenciesChanged = dependencies.some(dependency => changes.has(dependency));
                if ((valueChanged || dependenciesChanged) && dependencies.every(dependency => !errors[dependency])) {
                    if (!valueChanged && dependenciesChanged && triggerUpdates && entry.derive !== undefined) {
                        try {
                            inputs[key] = entry.derive(inputs, inputs[key] as never) as any;
                            errors[key] = false;
                            // errorIsDependent has no effect if there is no error.
                            if (!equalValues(inputs[key], lastValidatedInputs[key])) {
                                changes.add(key);
                            }
                        } catch (error) {
                            if (['text', 'textarea', 'password'].includes(entry.inputType)) {
                                inputs[key] = '' as any;
                            }
                            errors[key] = getErrorMessage(error);
                            errorIsDependent[key] = true;
                        }
                    } else if (!errors[key] || errorIsDependent[key]) { // Skip dependent validation only for independent errors in order to reset dependent errors when they are gone.
                        errorIsDependent[key] = true;
                        if (!valueChanged && dependenciesChanged && (entry.inputType === 'number' || entry.inputType === 'date') && (entry.minValue !== undefined || entry.maxValue !== undefined)) {
                            const error = validateBoundaries(this.entries[key], inputs[key], inputs);
                            errors[key] = error;
                            if (error) {
                                continue;
                            }
                        }
                        errors[key] = entry.validateDependently?.(inputs[key] as never, inputs) ?? false;
                    }
                }
            }
            if (this.getKeys().every(key => !errors[key])) {
                for (const key of this.getKeys()) {
                    const entry = this.entries[key];
                    if (entry.inputType === 'select' || entry.inputType === 'multiple') {
                        const newSelectOptions = Object.keys(normalizeToValue(entry.selectOptions, inputs));
                        if (newSelectOptions.length === 0) {
                            throw new Error('versioned-store.tsx: There should always be at least one option to select.');
                        }
                        if (entry.inputType === 'select') {
                            if (!newSelectOptions.includes(inputs[key] as string)) {
                                inputs[key] = newSelectOptions[0] as any;
                                changes.add(key);
                            }
                        } else if (entry.inputType === 'multiple') {
                            const input = inputs[key] as string[];
                            const filteredInput = input.filter(value => newSelectOptions.includes(value));
                            if (!equalValues(input, filteredInput)) {
                                inputs[key] = filteredInput as any;
                                changes.add(key);
                            }
                        }
                    } else if (entry.inputType === 'range') {
                        const value = inputs[key] as number;
                        const minValue = normalizeToValue(entry.minValue, inputs) ?? 0;
                        if (value < minValue) {
                            inputs[key] = minValue as any;
                            changes.add(key);
                        } else {
                            const maxValue = normalizeToValue(entry.maxValue, inputs) ?? 100;
                            if (value > maxValue) {
                                inputs[key] = maxValue as any;
                                changes.add(key);
                            }
                        }
                    }
                }
                if (triggerUpdates) {
                    // Update other values for all changed values.
                    for (const key of changes) {
                        const updateOtherValuesOnChange = this.entries[key].updateOtherValuesOnChange;
                        if (updateOtherValuesOnChange !== undefined) {
                            const partialNewState = await updateOtherValuesOnChange(inputs[key] as never, inputs);
                            Object.assign(inputs, partialNewState);
                        }
                    }
                }
                super.setState({
                    inputs,
                    lastValidatedInputs: inputs,
                    errors,
                    // errorIsDependent has an effect only if there are errors, but this branch is executed only if there are none.
                    states: [
                        ...this.state.states.slice(0, this.state.index + 1),
                        inputs,
                        ...this.state.states.slice(this.state.index + 2),
                    ],
                    index: this.state.index + 1,
                }, 'input', 'state');
                report('Use tool', { Identifier: this.identifier });
            } else {
                super.setState({
                    inputs,
                    lastValidatedInputs: inputs,
                    errors,
                    errorIsDependent,
                }, 'input');
            }
            // If there are changes, the 'onChange' handler is called after loading the new item from the local storage.
        } else if (callOnChangeEvenWhenNothingChanged && this.hasNoErrors()) {
            this.onChange?.(inputs, inputs);
        }
    }

    /**
     * Sets a new state with the given input.
     */
    public async setNewStateFromInput(
        key: keyof State,
        input: BasicValue,
    ): Promise<void> {
        this.setInput(key, input, true);
        return this.setNewStateFromCurrentInputs();
    }

    /**
     * Sets a new state with the given inputs without triggering input-related handlers.
     * This method should be used only on rare occasions because 'updateOtherInputsOnInput' and 'triggerOtherInputOnInput' are ignored.
     */
    public async setNewStateDirectly(
        inputs: Readonly<Partial<State>>,
    ): Promise<void> {
        super.setState({
            inputs: { ...this.getInputs(), ...inputs },
        });
        return this.setNewStateFromCurrentInputs();
    }

    protected changeState(newIndex: number): void {
        super.setState({
            inputs: this.state.states[newIndex],
            errors: this.defaultState.errors,
            index: newIndex,
        }, 'input', 'state');
    }

    /**
     * Reverts the inputs to the current state.
     */
    public cancelInputs(): void {
        this.changeState(this.state.index);
    }

    /**
     * Goes to the previous state in the history of values.
     */
    public goToPreviousState(): void {
        if (this.state.index === 0) {
            throw new Error('versioned-store.tsx: There is no previous state.');
        } else {
            this.changeState(this.state.index - 1);
        }
    }

    /**
     * Goes to the next state in the history of values.
     */
    public goToNextState(): void {
        if (this.state.index === this.state.states.length - 1) {
            throw new Error('versioned-store.tsx: There is no next state.');
        } else {
            this.changeState(this.state.index + 1);
        }
    }

    /**
     * Encodes the values of the given entries with Percent encoding.
     */
    public encodeInputs(
        entries: MissingOrUndefined<DynamicEntries<State>>,
    ): string[] {
        return Object.keys(filterUndefinedValues(entries)).map(key => key + '=' + encodeBasicValue(this.state.inputs[key as keyof State]));
    }

    /**
     * Decodes the given parts, sets them as inputs, and triggers the submit action if one is provided and all inputs are valid.
     */
    public decodeInputs(
        parts: readonly string[],
        submit?: (state: Readonly<State>) => any,
        verifyOnly = false,
    ): boolean {
        let validInputs = true;
        const newInputs: State = { ...this.getInputs() };
        for (const part of parts) {
            const index = part.indexOf('=');
            if (index > 0) {
                const key = part.substring(0, index) as keyof State;
                const value = part.substring(index + 1);
                const entry: AnyDynamicEntry<State> | undefined = this.entries[key];
                if (entry !== undefined) {
                    const input = decodeBasicValue(entry, value);
                    if (input !== undefined) {
                        newInputs[key] = input as any;
                    } else {
                        console.error(`Could not decode '${value}' as '${entry.inputType}'.`);
                        validInputs = false;
                    }
                } else {
                    console.error(`There is no entry for '${key.toString()}' in the store '${this.identifier}'.`);
                    validInputs = false;
                }
            } else {
                console.error(`Could not decode the part '${part}'.`);
                validInputs = false;
            }
        }
        if (!verifyOnly) {
            super.setState({
                inputs: newInputs,
            });
            this.setNewStateFromCurrentInputsInternally(true, false);
            if (submit !== undefined && this.hasNoErrors()) {
                submit(this.getCurrentState());
            }
        }
        return validInputs;
    }

    /**
     * Injects the current state into the wrapped component.
     */
    public injectCurrentState<ProvidedProps extends ObjectButNotFunction = {}>(
        WrappedComponent: ComponentType<State & ProvidedProps>,
    ) {
        const store = this;
        return class CurrentStateInjector extends Component<ProvidedProps> {
            public static displayName = `CurrentStateInjector(${getDisplayName(WrappedComponent)})`;

            public componentDidMount(): void {
                store.subscribe(this, 'state');
            }

            public componentWillUnmount(): void {
                store.unsubscribe(this, 'state');
            }

            public render(): ReactNode {
                // This order allows the parent component to override the injected state with properties.
                // In order to do so, 'ProvidedProps' has to include the relevant part of the state.
                return <WrappedComponent {...store.getCurrentState()} {...this.props} />;
            }
        };
    }

    /**
     * Injects the inputs into the wrapped component.
     */
    public injectInputs<ProvidedProps extends ObjectButNotFunction = {}>(
        WrappedComponent: ComponentType<State & ProvidedProps>,
    ) {
        const store = this;
        return class InputsInjector extends Component<ProvidedProps> {
            public static displayName = `InputsInjector(${getDisplayName(WrappedComponent)})`;

            public componentDidMount(): void {
                store.subscribe(this, 'input');
            }

            public componentWillUnmount(): void {
                store.unsubscribe(this, 'input');
            }

            public render(): ReactNode {
                // This order allows the parent component to override the injected inputs with properties.
                // In order to do so, 'ProvidedProps' has to include the relevant part of the inputs.
                return <WrappedComponent {...store.getInputs()} {...this.props} />;
            }
        };
    }
}
