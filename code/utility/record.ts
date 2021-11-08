/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

/**
 * Create a record from the given array by mapping each element to itself.
 */
export function arrayToRecord<T extends keyof any>(array: readonly T[]): Record<T, T> {
    const result = {} as Record<T, T>;
    for (const element of array) {
        result[element] = element;
    }
    return result;
}

/**
 * Useful for string-based lookup tables.
 */
export type Dictionary<T = string> = Record<string, T | undefined>;

/**
 * Find the key in the given dictionary which maps to the given value.
 */
export function reverseLookup<T = string>(dictionary: Dictionary<T>, value: T): string | undefined {
    return Object.keys(dictionary).find(key => dictionary[key] === value);
}
