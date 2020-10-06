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
 * A function which returns a value of the given type.
 */
export type Function<T extends NotFunction, I = void> = (input: I) => T;

/**
 * Value or function which returns a value of the same type.
 */
export type ValueOrFunction<T extends NotFunction, I = void> = T | Function<T, I>;

/**
 * Handles an arbitrary event.
 */
export type EventHandler = (event: Event) => any;
