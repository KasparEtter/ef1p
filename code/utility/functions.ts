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

export function removeFromArrayOnce<T>(array: T[], element: T): boolean {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

export function removeFromArrayAll<T>(array: T[], element: T): boolean {
    let found = false;
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] === element) {
            array.splice(i, 1);
            found = true;
        }
    }
    return found;
}

export function replaceFirstInPlace<T>(array: T[], oldElement: T, newElement: T): boolean {
    const index = array.indexOf(oldElement);
    if (index !== -1) {
        array[index] = newElement;
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

export function nonEmpty(text: string): boolean {
    return text.length > 0;
}

export function escapeDoubleQuotes(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function doubleQuote(text: string): string {
    return `"${escapeDoubleQuotes(text)}"`;
}

export function doubleQuoteIfWhitespace(text: string): string {
    return /\s/.test(text) ? doubleQuote(text) : text;
}

export function escapeSingleQuote(text: string): string {
    return text.replace(/'/g, '\'\\\'\'');
}

export function singleQuote(text: string): string {
    return `'${escapeSingleQuote(text)}'`;
}

export function toHex(text: number, minLength = 0): string {
    return text.toString(16).toUpperCase().padStart(minLength, '0');
}

/**
 * Returns the given string with newlines normalized to CR + LF.
 */
export function normalizeNewlines(text: string): string {
    return text.replace(/\r?\n/g, '\r\n');
}

/**
 * Returns the given string with runs of whitespace normalized to a single space.
 */
export function normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ');
}

/**
 * Returns how many times the given string matches the given regular expression.
 */
export function countOccurrences(text: string, regex: RegExp): number {
    if (!regex.global) {
        throw Error('Set the global flag on the provided regular expression.');
    }
    return (text.match(regex) || []).length;
}

/**
 * Splits the given text on the first of occurrence of the given delimiter.
 * If the delimiter is not found, the original string is returned in the first part.
 * The second part always starts with the delimiter but may contain no other characters.
 */
export function splitOnFirstOccurrence(text: string, delimiter: string): [string, string] {
    const index = text.indexOf(delimiter);
    return index >= 0 ? [text.substring(0, index), text.substring(index)] : [text, delimiter];
}

/**
 * Splits the given string at the given separator unless the separator is within double quotes.
 */
export function splitOutsideOfDoubleQuotes(text: string, separator: string, unescape = false, trim = false): string[] {
    const result = new Array<string>();
    let current = '';
    let quoted = false;
    let escaped = false;
    for (const character of Array.from(text)) {
        if (escaped) {
            escaped = false;
            current += character;
        } else if (character === '\\') {
            escaped = true;
            if (!unescape) {
                current += character;
            }
        } else if (character === '"') {
            quoted = !quoted;
            current += character;
        } else if (!quoted && character === separator) {
            result.push(trim ? current.trim() : current);
            current = '';
        } else {
            current += character;
        }
    }
    result.push(trim ? current.trim() : current);
    return result;
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
