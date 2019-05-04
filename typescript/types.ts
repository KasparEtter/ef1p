import { ReactNode } from 'react';

/**
 * Array with the keys of the given type.
 */
export type KeysOf<T> = Array<keyof T>;

/**
 * Constrains a type to objects without allowing functions.
 * (See https://github.com/Microsoft/TypeScript/issues/27278.)
 */
export type ObjectButNotFunction = object & { prototype?: never; };

/**
 * Declares children to be combined with other properties.
 */
export type Children = {
    children: ReactNode;
};
