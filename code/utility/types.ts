/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

/**
 * Array with the keys of the given type.
 */
export type KeysOf<T> = readonly (keyof T)[];

/**
 * Constrains a type to something other than a function.
 * (See https://github.com/Microsoft/TypeScript/issues/27278.)
 */
export type NotFunction = (object | string | bigint | number | boolean) & { prototype?: never; } | symbol;

/**
 * Constrains a type to objects without allowing functions.
 * (See https://github.com/Microsoft/TypeScript/issues/27278.)
 */
export type ObjectButNotFunction = object & { prototype?: never; };

/**
 * Value or array of the same type.
 */
export type ValueOrArray<T> = T | readonly T[];

/**
 * A function which returns a value of the given type.
 */
export type Function<O, I = void> = (input: I) => O;

/**
 * Value or function which returns a value of the same type.
 */
export type ValueOrFunction<O extends NotFunction | undefined, I = void> = O | Function<O, I>;

/**
 * Evaluates an item to true or false.
 */
export type Condition<T> = (item: T) => boolean;

/**
 * Handles an arbitrary event.
 */
export type EventHandler<E extends Event = Event> = (event: E) => any;

/**
 * A button with the given label, tooltip, and handler.
 */
export interface Button<Event> {
    /**
     * The text on the button.
     */
    readonly label: string;

    /**
     * A description of what the button does.
     */
    readonly tooltip: string;

    /**
     * What happens when the user clicks on the button.
     * (This weird declaration is overridden by DetermineButton in entry.ts.)
     */
    readonly onClick: (event: Event, _?: any) => any;
};

/**
 * Allows all properties in T to be missing or undefined.
 * Partial<T> allows them only to be missing when using
 * https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes.
 */
export type MissingOrUndefined<T> = {
    [P in keyof T]?: T[P] | undefined;
};

/**
 * Constrains a type to something other than an array.
 */
export type NotArray = (object | string | bigint | number | boolean) & { length?: never; };

/**
 * When only one of two return values has to be provided.
 */
export type OptionalReturnValues2<T1 extends NotArray, T2> = T1 | [T1 | undefined, T2];

/**
 * When only one of three return values has to be provided.
 */
export type OptionalReturnValues3<T1 extends NotArray, T2, T3> = T1 | [T1 | undefined, T2] | [T1 | undefined, T2 | undefined, T3];
