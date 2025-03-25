/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../utility/color';
import { getErrorMessage } from '../utility/error';
import { normalizeToValue } from '../utility/normalization';
import { decodePercent, encodePercent } from '../utility/string';
import { Button, KeysOf, MissingOrUndefined, ValueOrArray, ValueOrFunction } from '../utility/types';

export type TextBasedBasicValue = string | readonly string[];
export type NonBooleanBasicValue = number | TextBasedBasicValue;
export type BasicValue = boolean | NonBooleanBasicValue;

/**
 * Do not extend this type in an actual state.
 * It is just used to constrain generic types.
 * https://github.com/microsoft/TypeScript/issues/10941
 */
export type BasicState<State> = {
    [key in keyof State]: BasicValue;
}

export function equalValues(a: BasicValue, b: BasicValue): boolean {
    if (a === b) {
        return true;
    } else if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

export function differ<State extends BasicState<State>>(newState: Readonly<State>, oldState: Readonly<State>, ...keys: KeysOf<State>): boolean {
    return keys.some(key => !equalValues(newState[key], oldState[key]));
}

/**
 * Static entries can be used only to output information to the user.
 */
export interface Entry<Value extends BasicValue, State extends BasicState<State> = {}> {
    /**
     * The label of the entry when displayed for input or output.
     */
    readonly label: string;

    /**
     * The tooltip of the entry when displayed for input or output.
     * The function is called with a potentially invalid input.
     */
    readonly tooltip: ValueOrFunction<string, Value>;

    /**
     * The default value of this entry.
     */
    readonly defaultValue: Value;

    /**
     * The color of this entry when it is being output.
     * The function is called only with a valid value.
     */
    readonly outputColor?: ValueOrFunction<Color, Value>;

    /**
     * Transforms the value for output.
     * The function is called only with a valid value and a valid state
     * except for 'range' inputs, where the function is called with the current inputs.
     */
    readonly transform?: (value: Value, state: Readonly<State>) => string;

    /**
     * Whether to skip the value in a list of outputs.
     * The function is called only with a valid value and a valid state.
     * The order of the arguments is inverted to be compatible with the 'disabled' property.
     */
    readonly skip?: (state: Readonly<State>, value: Value) => boolean;
}

export interface ArrayEntry<State extends BasicState<State> = {}> extends Entry<string[], State> {
    /**
     * How to separate the elements of the array when outputting the value.
     * It defaults to ', '.
     */
    readonly valueSeparator?: string;
}

export type Entries<State extends BasicState<State>> = {
    // The key is intentionally not restricted to keyof State so that you can pass other entries to OutputEntries as well.
    readonly [key: string]: Entry<any, State>;
};

export interface ProvidedEntries<State extends BasicState<State>> {
    // Entries cannot be an array as we need the keys to access the associated state.
    // This also mean that you cannot have the same entry more than once in the same output.
    readonly entries: Entries<State>;
}

export const booleanInputTypes = ['checkbox', 'switch'] as const;
export type BooleanInputType = typeof booleanInputTypes[number];

export const numberInputTypes = ['number', 'range'] as const;
export type NumberInputType = typeof numberInputTypes[number];

export const textInputTypes = ['text', 'textarea', 'password'] as const;
export type TextInputType = typeof textInputTypes[number];

export const pickerInputTypes = ['date', 'color'] as const;
export type PickerInputType = typeof pickerInputTypes[number];

export const dropdownInputTypes = ['select'] as const;
export type DropdownInputType = typeof dropdownInputTypes[number];

export const arrayInputTypes = ['multiple'] as const;
export type ArrayInputType = typeof arrayInputTypes[number];

export const stringInputTypes = (textInputTypes as readonly string[]).concat(...pickerInputTypes).concat(...dropdownInputTypes);
export type StringInputType = TextInputType | PickerInputType | DropdownInputType;

export type NonBooleanInputType = NumberInputType | StringInputType | ArrayInputType;
export type InputType = BooleanInputType | NonBooleanInputType;

export type InputError = string | false;

export type Errors<State extends BasicState<State>> = {
    [key in keyof State]: InputError;
};

/**
 * A button to determine a suitable value for a dynamic entry.
 */
export interface DetermineButton<Value extends BasicValue, State extends BasicState<State> = {}> extends Button<Value> {
    /**
     * Disables the button when one of the entry's dependencies has an error.
     * Defaults to false.
     */
    readonly requireValidDependencies?: boolean;

    /**
     * Disables the button when the entry's input is not independently valid.
     * Defaults to false.
     */
    readonly requireIndependentlyValidInput?: boolean;

    /**
     * Whether to disable the button.
     * The function is called after the checks of the above flags have been performed.
     */
    readonly disable?: (input: Value, inputs: Readonly<State>) => boolean;

    /**
     * Whether to hide the button.
     * The function is called before the checks of the above flags have been performed.
     */
    readonly hide?: (input: Value, inputs: Readonly<State>) => boolean;

    /**
     * Determines a suitable value for the dynamic entry.
     * The handler may throw an 'Error' object as an error, which is caught and displayed as an input error.
     * The returned value is both independently and dependently validated just as if it was input by the user.
     */
    readonly onClick: (input: Value, inputs: Readonly<State>) => Promise<Value>;
};

/**
 * Dynamic entries can be input by the user and thus have an associated state.
 */
interface DynamicEntry<Value extends BasicValue, State extends BasicState<State> = {}> extends Entry<Value, State> {
    /**
     * One of the above input types.
     */
    readonly inputType: InputType;

    /**
     * Width of the label in pixels.
     * Provide this only if you want to override the estimated label width.
     */
    readonly labelWidth?: number;

    /**
     * Whether this input is read-only.
     * Defaults to false.
     */
    readonly readOnly?: boolean;

    /**
     * Whether this input shall stay enabled when other inputs have dependent errors.
     * Defaults to false.
     */
    readonly stayEnabled?: boolean;

    /**
     * Determines whether this input is disabled.
     * Defaults to false and overrides 'stayEnabled'.
     * The function is called with potentially invalid inputs.
     */
    readonly disable?: (inputs: Readonly<State>) => boolean;

    /**
     * The color of the input label.
     * The function is called with a potentially invalid input and potentially invalid inputs.
     */
    readonly inputColor?: (input: Value, inputs: Readonly<State>) => Color;

    /**
     * The keys of the entries on which this entry depends for validation and derivation.
     * The key of this entry should not be added to this list as it is included implicitly.
     */
    readonly dependencies?: ValueOrArray<keyof State>;

    /**
     * Validates this input independently of its dependencies if its value changed.
     * This is typically used to ensure that the input is syntactically valid.
     * The function is called with a non-validated input.
     */
    readonly validateIndependently?: (input: Value) => InputError;

    /**
     * Validates this input if its value or the value of one of its dependencies changed.
     * The function is called only if all dependencies and this entry are at least independently valid.
     * All dependencies which come earlier in the entries object have been fully validated.
     */
    readonly validateDependently?: (input: Value, inputs: Readonly<State>) => InputError;

    /**
     * Whether to validate the input of this entry independently on input.
     * If there is 'updateOtherInputsOnInput', this is implicitly true.
     * Otherwise, this flag defaults to false.
     */
    readonly validateIndependentlyOnInput?: boolean;

    /**
     * Derives the value of this entry if the value of one of its dependencies changed and the value of this entry did not change.
     * The function may throw an 'Error' object as an error, which is caught and displayed as an input error.
     * The function is called only if all dependencies are at least independently valid.
     * All dependencies which come earlier in the entries object have been fully validated.
     * The derived value has to be fully valid; it is no longer validated.
     * The values of its dependencies can change only if the current input is independently valid.
     */
    readonly derive?: (inputs: Readonly<State>, input: Value) => Value;

    /**
     * Provide a function to update other values in the same state when the value of this entry changed by advancing to a new state in the same window.
     * The function may not throw an error, and no updates are triggered for the updated values.
     * The updated values are considered to be valid, i.e. they are no longer being validated.
     * The function is called only with a valid value and a valid state.
     */
    readonly updateOtherValuesOnChange?: (newValue: Value, newState: Readonly<State>) => Promise<Readonly<Partial<State>>>;

    /**
     * Provide a function to update other inputs when the input of this entry changed in the same window.
     * The function may throw an 'Error' object as an error, which is caught and displayed as an input error.
     * Any errors of updated inputs are erased, and no updates are triggered for the updated inputs.
     * The function is called with an independently valid input and potentially invalid inputs.
     */
    readonly updateOtherInputsOnInput?: (input: Value, inputs: Readonly<State>, errors: Readonly<Errors<State>>) => Readonly<Partial<State>>;

    /**
     * The key of the entry whose 'updateOtherInputsOnInput' handler shall be triggered on input.
     * The referenced entry must have an 'updateOtherInputsOnInput' handler.
     * If this handler throws an error, the error is attributed to the referenced entry.
     * The function is called with potentially invalid inputs.
     */
    readonly triggerOtherInputOnInput?: ValueOrFunction<keyof State, Readonly<State>>;

    /**
     * Creates buttons which the user can press in order to determine a suitable value for this entry.
     * Depending on the flags set in the button's declaration, a button is automatically disabled
     * if one of the dependencies is invalid or the value of this entry is not independently valid.
     */
    readonly determine?: ValueOrArray<DetermineButton<Value, State>> | undefined;
}

export interface DynamicBooleanEntry<State extends BasicState<State> = {}> extends DynamicEntry<boolean, State> {
    readonly inputType: BooleanInputType;
}

interface DynamicNonBooleanEntry<Value extends NonBooleanBasicValue, State extends BasicState<State> = {}> extends DynamicEntry<Value, State> {
    readonly inputType: NonBooleanInputType;

    /**
     * Width of the input field in pixels.
     */
    readonly inputWidth?: number;
}

interface DynamicBoundedEntry<Value extends number | string, State extends BasicState<State> = {}> extends DynamicNonBooleanEntry<Value, State> {
    readonly inputType: NumberInputType | 'date';

    /**
     * This property defaults to 0 for 'range' inputs and to Number.MIN_SAFE_INTEGER for 'number' inputs.
     * The function is called with potentially invalid inputs.
     */
    readonly minValue?: ValueOrFunction<Value, Readonly<State>>;

    /**
     * This property defaults to 100 for 'range' inputs and to Number.MAX_SAFE_INTEGER for 'number' inputs.
     * The function is called with potentially invalid inputs.
     */
    readonly maxValue?: ValueOrFunction<Value, Readonly<State>>;
}

interface DynamicNumberBasedEntry<State extends BasicState<State> = {}> extends DynamicBoundedEntry<number, State> {
    readonly inputType: NumberInputType;

    /**
     * The size of the steps between 'minValue' and 'maxValue'.
     * Adherence to the step value is not enforced for any inputs.
     * For 'number' entries, it is only relevant for the implicit 'onUpOrDown'.
     * This property defaults to 1.
     * The function is called with potentially invalid inputs.
     */
    readonly stepValue?: ValueOrFunction<number, Readonly<State>>;

    /**
     * The number of digits to display after the decimal point.
     * This property defaults to 0 and may be at most 20.
     */
    readonly digits?: number;
}

export type UpOrDown = 'up' | 'down';

interface DynamicUpOrDownEntry<Value extends number | string, State extends BasicState<State> = {}> extends DynamicNonBooleanEntry<Value, State> {
    readonly inputType: 'number' | 'text';

    /**
     * Whether the 'onUpOrDown' function requires that all dependencies are fully valid.
     * This property defaults to false.
     */
    readonly requireValidDependenciesForUpOrDown?: boolean;

    /**
     * Handles the up or down arrow keys on 'number' and 'text' inputs.
     * Please note that providing such a handler disables the history feature of 'text' inputs.
     * The 'onUpOrDown' function is called only if the input of this entry is independently valid.
     * Depending on 'requireValidDependencies', the function is called only with valid dependencies.
     */
    readonly onUpOrDown?: (event: UpOrDown, input: Value, inputs: Readonly<State>) => Value;
}

export interface DynamicNumberEntry<State extends BasicState<State> = {}> extends DynamicNumberBasedEntry<State>, DynamicUpOrDownEntry<number, State> {
    readonly inputType: 'number';
}

export interface DynamicRangeEntry<State extends BasicState<State> = {}> extends DynamicNumberBasedEntry<State> {
    readonly inputType: 'range';
}

interface DynamicTextBasedEntry<State extends BasicState<State> = {}> extends DynamicNonBooleanEntry<string, State> {
    readonly inputType: TextInputType;

    /**
     * The placeholder of the input field.
     * The function is called with potentially invalid inputs.
     */
    readonly placeholder?: ValueOrFunction<string, Readonly<State>>;
}

export interface DynamicTextEntry<State extends BasicState<State> = {}> extends DynamicTextBasedEntry<State>, DynamicUpOrDownEntry<string, State> {
    readonly inputType: 'text';

    /**
     * The suggested values are added to the datalist but not to the history.
     * The function is called with potentially invalid inputs.
     */
    readonly suggestedValues?: ValueOrFunction<string[], Readonly<State>>;
}

export interface DynamicTextareaEntry<State extends BasicState<State> = {}> extends DynamicTextBasedEntry<State> {
    readonly inputType: 'textarea';

    /**
     * The number of rows of the textarea.
     * This property defaults to 3.
     */
    readonly rows?: number;
}

export interface DynamicPasswordEntry<State extends BasicState<State> = {}> extends DynamicTextBasedEntry<State> {
    readonly inputType: 'password';
}

export interface DynamicDateEntry<State extends BasicState<State> = {}> extends DynamicBoundedEntry<string, State> {
    readonly inputType: 'date';
}

export interface DynamicColorEntry<State extends BasicState<State> = {}> extends DynamicNonBooleanEntry<string, State> {
    readonly inputType: 'color';
}

interface DynamicSelectEntry<Value extends TextBasedBasicValue, State extends BasicState<State> = {}> extends DynamicNonBooleanEntry<Value, State> {
    readonly inputType: 'select' | 'multiple';

    /**
     * One or more valid options for this select entry.
     * The function is called only with a valid state.
     */
    readonly selectOptions: ValueOrFunction<Record<string, string>, Readonly<State>>;
}

export interface DynamicSingleSelectEntry<State extends BasicState<State> = {}> extends DynamicSelectEntry<string, State> {
    readonly inputType: 'select';
}

export interface DynamicMultipleSelectEntry<State extends BasicState<State> = {}> extends DynamicSelectEntry<string[], State>, ArrayEntry<State> {
    readonly inputType: 'multiple';
}

export type AnyDynamicEntry<State extends BasicState<State> = {}> =
    DynamicBooleanEntry<State> |
    DynamicNumberEntry<State> |
    DynamicRangeEntry<State> |
    DynamicTextEntry<State> |
    DynamicTextareaEntry<State> |
    DynamicPasswordEntry<State> |
    DynamicDateEntry<State> |
    DynamicColorEntry<State> |
    DynamicSingleSelectEntry<State> |
    DynamicMultipleSelectEntry<State>;

// A return type of 'entry is AnyDynamicEntry<State>' does not work well because it changes TypeScript's type inference.
export function isDynamicEntry<State extends BasicState<State>>(entry: Entry<any, State>): boolean {
    return (entry as DynamicEntry<any, State>).inputType !== undefined;
}

export type DynamicEntries<State extends BasicState<State>> = {
    readonly [key in keyof State]: AnyDynamicEntry<State>;
};

export interface ProvidedDynamicEntries<State extends BasicState<State>> {
    readonly entries: MissingOrUndefined<DynamicEntries<State>>;
}

export function validateBoundaries<State extends BasicState<State>>(
    entry: AnyDynamicEntry<State>,
    input: BasicValue,
    inputs: Readonly<State>,
): InputError {
    if (entry.inputType === 'number') {
        const value = input as number;
        if (!entry.digits && !Number.isInteger(value)) {
            return `This value has to be an integer.`;
        }
        const minValue = normalizeToValue(entry.minValue, inputs) ?? Number.MIN_SAFE_INTEGER;
        if (value < minValue) {
            return `This value may not be less than ${minValue}.`;
        }
        const maxValue = normalizeToValue(entry.maxValue, inputs) ?? Number.MAX_SAFE_INTEGER;
        if (value > maxValue) {
            return `This value may not be greater than ${maxValue}.`;
        }
    } else if (entry.inputType === 'date') {
        const date = new Date(input as string);
        const minDate = normalizeToValue(entry.minValue, inputs);
        if (minDate !== undefined && date < new Date(minDate)) {
            return `This date may not be less than ${minDate}.`;
        }
        const maxDate = normalizeToValue(entry.maxValue, inputs);
        if (maxDate !== undefined && date > new Date(maxDate)) {
            return `This date may not be greater than ${maxDate}.`;
        }
    }
    return false;
}

export function validateIndependently<State extends BasicState<State>>(
    entry: AnyDynamicEntry<State>,
    input: BasicValue,
    inputs: Readonly<State>,
): InputError {
    return validateBoundaries(entry, input, inputs) || (entry.validateIndependently?.(input as never) ?? false);
}

export function validateByTrial<Value extends BasicValue, State extends BasicState<State>>(
    handler: (input: Value, inputs: Readonly<State>) => any,
): (input: Value, inputs: Readonly<State>) => string | false {
    return (input: Value, inputs: Readonly<State>) => {
        try {
            handler(input, inputs);
        } catch (error) {
            return getErrorMessage(error);
        }
        return false;
    };
}

export function outputValue<State extends BasicState<State>>(
    entry: AnyDynamicEntry<State>,
    value: BasicValue,
    state?: Readonly<State>,
): string {
    if (entry.transform !== undefined) {
        if (state === undefined) {
            throw new Error('entry.ts: A state has to be provided for entries with a transform function.');
        }
        return entry.transform(value as never, state);
    }
    if (Array.isArray(value)) {
        return value.join((entry as ArrayEntry<State>).valueSeparator ?? ', ');
    }
    if (entry.inputType === 'number' || entry.inputType === 'range') {
        return (value as number).toFixed(entry.digits ?? 0);
    }
    return value.toString();
}

export function encodeBasicValue(value: BasicValue): string {
    if (Array.isArray(value)) {
        return value.map(encodeBasicValue).join(',');
    } else {
        return encodePercent(value.toString());
    }
}

export function decodeBasicValue(entry: AnyDynamicEntry<any>, value: string): BasicValue | undefined {
    if (booleanInputTypes.includes(entry.inputType as BooleanInputType)) {
        if (['true', 'false'].includes(value)) {
            return value === 'true';
        }
    } else if (numberInputTypes.includes(entry.inputType as NumberInputType)) {
        if (/^-?(\d+(\.\d*)?|\.\d+)$/.test(value)) {
            return Number(value);
        }
    } else if (stringInputTypes.includes(entry.inputType as StringInputType)) {
        const input = decodePercent(value);
        if ((entry.inputType !== 'date' || /^\d{4}-\d{2}-\d{2}$/.test(input)) && (entry.inputType !== 'color' || /^#[0-9a-f]{6}$/i.test(input))) {
            return input; // The validity of the 'select' options is ensured in the 'setStateFromInputs' method of the 'VersionedStore'.
        }
    } else if (arrayInputTypes.includes(entry.inputType as ArrayInputType)) {
        return value.split(',').map(decodePercent); // Also validated in the 'VersionedStore'.
    }
    return undefined;
}
