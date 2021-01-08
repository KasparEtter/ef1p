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
 * Useful for simple lookup tables.
 */
export type Dictionary<T = string> = { [key: string]: T | undefined };

/**
 * Value or array of the same type.
 */
export type ValueOrArray<T> = T | T[];

/**
 * A function which returns a value of the given type.
 */
export type Function<O, I = undefined> = (input: I) => O;

/**
 * Value or function which returns a value of the same type.
 */
export type ValueOrFunction<O extends NotFunction | undefined, I = undefined> = O | Function<O, I>;

/**
 * Handles an arbitrary event.
 */
export type EventHandler = (event: Event) => any;

/**
 * A button with the given text, title, and handler.
 */
export interface Button<I = undefined, O = any> {
    text: string;
    title: string;
    onClick: (input: I) => O;
};
