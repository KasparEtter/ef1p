/**
 * Array with the keys of the given type.
 */
export type KeysOf<T> = (keyof T)[];

/**
 * Constrains a type to objects without allowing functions.
 * (See https://github.com/Microsoft/TypeScript/issues/27278.)
 */
export type ObjectButNotFunction = object & { prototype?: never; };

/**
 * Useful for simple lookup tables.
 */
export type Dictionary<T = string> = { [key: string]: T | undefined };
