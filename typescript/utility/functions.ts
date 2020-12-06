import { Dictionary, NotFunction, ValueOrArray, ValueOrFunction } from './types';

export function normalizeToValue<T extends NotFunction | undefined, I = undefined>(argument: ValueOrFunction<T, I>, input: I): T {
    return typeof argument === 'function' ? argument(input) : argument;
}

export function normalizeToArray<T>(argument?: ValueOrArray<T>): T[] {
    if (argument === undefined) {
        return [];
    } else {
        return Array.isArray(argument) ? argument : [ argument ];
    }
}

export function removeFromArrayOnce<T>(array: T[], value: T): boolean {
    const index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

export function removeFromArrayAll<T>(array: T[], value: T): boolean {
    let found = false;
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] === value) {
            array.splice(i, 1);
            found = true;
        }
    }
    return found;
}

export function replaceFirstInPlace<T>(array: T[], oldValue: T, newValue: T): boolean {
    const index = array.indexOf(oldValue);
    if (index !== -1) {
        array[index] = newValue;
        return true;
    } else {
        return false;
    }
}

// https://codereview.stackexchange.com/a/202442
export function filterUndefined<T>(ts: (T | undefined)[]): T[] {
    return ts.filter((t: T | undefined): t is T => t !== undefined)
}

export function flatten<T>(array: T[][]): T[] {
    return array.reduce((flat, next) => flat.concat(next), []);
}

export function unique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

export function sortNumbers(array: number[]): number[] {
    return array.sort((a, b) => a - b);
}

export function nonEmpty(value: string): boolean {
    return value.length > 0;
}

export function escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Escapes and quotes the given value.
 */
export function quote(value: string): string {
    return `"${escape(value)}"`;
}

/**
 * Quotes the given value if it contains a space.
 */
export function quoteIfNecessary(value: string): string {
    return value.includes(' ') ? quote(value) : value;
}

export function createRecord(array: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    for (const element of array) {
        result[element] = element;
    }
    return result;
}

export function getInitialized<T>(object: { [key: string]: T[] | undefined }, key: string): T[] {
    let result = object[key];
    if (result === undefined) {
        result = [];
        object[key] = result;
    }
    return result;
}

export function reverseLookup<T = string>(dictionary: Dictionary<T>, value: T): string | undefined {
    return Object.keys(dictionary).find(key => dictionary[key] === value);
}

export function getRandomString(): string {
    return Math.random().toString(36).substring(2);
}

export function sleep(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
