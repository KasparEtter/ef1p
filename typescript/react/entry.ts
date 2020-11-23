import { Color } from '../utility/color';
import { Function, ObjectButNotFunction, ValueOrArray, ValueOrFunction } from '../utility/types';

export type ValueType = boolean | number | string;
export type ErrorType = string | false;

/**
 * Static entries can only be used to output information to the user.
 */
export interface Entry<T extends ValueType, State extends ObjectButNotFunction = {}> {
    readonly name: string;
    readonly description: ValueOrFunction<string, T>;
    defaultValue: ValueOrFunction<T>;
    outputColor?: ValueOrFunction<Color, T>;

    /**
     * Transforms the value for output.
     */
    readonly transform?: (value: T, state: State) => string;

    /**
     * Whether to skip the value in a list of outputs.
     */
    readonly skip?: (state: State, value: T) => boolean; // Order inverted to be compatible with the disabled type.
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
export interface DynamicEntry<T extends ValueType, State extends ObjectButNotFunction = {}> extends Entry<T, State> {
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

    /**
     * Creates a button which the user can press in order to determine a suitable value for this entry.
     */
    readonly determine?: Function<Promise<[T, ErrorType]>, State>;
}

export function isDynamicEntry<T extends ValueType, State extends ObjectButNotFunction = {}>(entry: Entry<T, State>): entry is DynamicEntry<T, State> {
    return (entry as DynamicEntry<T, State>).inputType !== undefined;
}
