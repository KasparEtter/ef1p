import { Dictionary, EventHandler, NotFunction, ValueOrArray, ValueOrFunction } from './types';

/* ------------------------------ Normalization ------------------------------ */

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

/* ------------------------------ Array ------------------------------ */

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
export function filterUndefined<T>(array: (T | undefined)[]): T[] {
    return array.filter((t: T | undefined): t is T => t !== undefined)
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

/* ------------------------------ String ------------------------------ */

export function nonEmpty(value: string): boolean {
    return value.length > 0;
}

export function escapeDoubleQuotes(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function doubleQuote(value: string): string {
    return `"${escapeDoubleQuotes(value)}"`;
}

export function doubleQuoteIfWhitespace(value: string): string {
    return /\s/.test(value) ? doubleQuote(value) : value;
}

export function escapeSingleQuote(value: string): string {
    return value.replace(/'/g, '\'\\\'\'');
}

export function singleQuote(value: string): string {
    return `'${escapeSingleQuote(value)}'`;
}

export function toHex(value: number, minLength = 0): string {
    return value.toString(16).toUpperCase().padStart(minLength, '0');
}

/**
 * Returns the given string with newlines normalized to CR + LF.
 */
export function normalizeNewlines(value: string): string {
    return value.replace(/\r?\n/g, '\r\n');
}

/**
 * Returns how many times the given string matches the given regular expression.
 */
export function countOccurrences(value: string, regex: RegExp): number {
    if (!regex.global) {
        throw Error('Set the global flag on the provided regular expression.');
    }
    return (value.match(regex) || []).length
}

/* ------------------------------ Records ------------------------------ */

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

/* ------------------------------ Other ------------------------------ */

export function getRandomString(): string {
    return Math.random().toString(36).substring(2);
}

export function sleep(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function bind(elementId: string, event: keyof GlobalEventHandlersEventMap, callback: EventHandler): void {
    document.getElementById(elementId)!.addEventListener(event, callback);
}

/**
 * Clones the given object by encoding it as JSON and then parsing it again.
 * Only use this function for objects that can be represented as JSON.
 * See https://stackoverflow.com/a/122704/12917821 for more information.
 */
export function deepCopy<T extends NotFunction>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}
