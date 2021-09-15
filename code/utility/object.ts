/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { NotFunction } from './types';

export interface Equality<T> {
    equals(other: T): boolean;
}

/**
 * Clones the given object by encoding it as JSON and then parsing it again.
 * Only use this function for objects that can be represented as JSON.
 * See https://stackoverflow.com/a/122704/12917821 for more information.
 */
export function deepCopy<T extends NotFunction>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}
