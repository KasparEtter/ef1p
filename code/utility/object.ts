/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { NotFunction } from './types';

export interface Equality<T> {
    equals(that: T): boolean;
}

export interface StrictEquality<T> extends Equality<T> {
    strictlyEquals(that: T): boolean;
}

/**
 * Clones the given object by encoding it as JSON and then parsing it again.
 * Only use this function for objects that can be represented as JSON.
 * See https://stackoverflow.com/a/122704/12917821 for more information.
 */
export function deepCopy<T extends NotFunction>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}

// Object.fromEntries(Object.entries(object).map(([k, v]) => [k, v * v])) requires ES2019.
export function mapEntries<K extends string | number | symbol, I, O>(object: { [key in K]: I }, map: (value: I, key: K) => O): { [key in K]: O } {
    const result: any = {};
    for (const [key, value] of Object.entries(object)) {
        result[key] = map(value as I, key as K);
    }
    return result;
}

// Object.fromEntries(Object.entries(object).filter(([_, v]) => v !== undefined)) requires ES2019.
export function filterUndefinedValues<T extends object>(object: T): Partial<T> {
    const result: any = {};
    for (const [key, value] of Object.entries(object)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}
