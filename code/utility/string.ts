/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

export function nonEmpty(text: string): boolean {
    return text.length > 0;
}

export function getRandomString(): string {
    return Math.random().toString(36).substring(2);
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

export function toHex(value: number, minLength = 0, upperCase = true): string {
    let hex = value.toString(16);
    if (upperCase) {
        hex = hex.toUpperCase();
    }
    return hex.padStart(minLength, '0');
}

export function removeThousandSeparators(value: string): string {
    return value.replace(/[', ]/g, '');
}

export function insertThousandSeparators(value: string | number | bigint): string {
    // https://stackoverflow.com/a/2901298/12917821
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
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
