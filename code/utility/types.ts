/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

/**
 * Array with the keys of the given type.
 */
export type KeysOf<T> = (keyof T)[];

/**
 * Constrains a type to something other than a function.
 * (See https://github.com/Microsoft/TypeScript/issues/27278.)
 */
export type NotFunction = (object | string | number | boolean) & { prototype?: never; };

/**
 * Constrains a type to objects without allowing functions.
 * (See https://github.com/Microsoft/TypeScript/issues/27278.)
 */
export type ObjectButNotFunction = object & { prototype?: never; };

/**
 * Value or array of the same type.
 */
export type ValueOrArray<T> = T | T[];

/**
 * A function which returns a value of the given type.
 */
export type Function<O, I = void> = (input: I) => O;

/**
 * Value or function which returns a value of the same type.
 */
export type ValueOrFunction<O extends NotFunction | undefined, I = void> = O | Function<O, I>;

/**
 * Handles an arbitrary event.
 */
export type EventHandler<E extends Event = Event> = (event: E) => any;

/**
 * A button with the given text, title, and handler.
 */
export interface Button<I1 = void, O = any, I2 = void> {
    readonly text: string;
    readonly title: string;
    readonly onClick: (input1: I1, input2: I2) => O;
    readonly disable?: (input1: I1, input2: I2) => boolean;
    readonly hide?: (input1: I1, input2: I2) => boolean;
};
