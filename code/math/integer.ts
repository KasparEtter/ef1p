/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { regex } from '../utility/string';

import { minusOne } from './utility';

/* ------------------------------ Regular expressions ------------------------------ */

export const minusSymbols = ['-', '−', '–']; // hyphen-minus, minus sign, en dash
export const minusClass = `[${minusSymbols.join('')}]`;
export const minusRegex = new RegExp(minusClass, 'g');

export const plusOrMinusSymbols = [...minusSymbols, '+']; // hyphen-minus has to be at the start.
export const plusOrMinusClass = `[${plusOrMinusSymbols.join('')}]`;
export const plusOrMinusRegex = new RegExp(plusOrMinusClass, 'g');

export const separatorSymbolsWithoutComma = ".'_\\s";
export const separatorSymbolsString = ',' + separatorSymbolsWithoutComma;
export const separatorSymbolsRegex = new RegExp(`[${separatorSymbolsString}]`, 'g');

// validate: input => !nonNegativeIntegerRegex.test(input) && 'This integer may not be negative.'
export const nonNegativeIntegerWithoutComma = `(\s*0x)?[0-9a-f${separatorSymbolsWithoutComma}]*`;
export const nonNegativeIntegerString = `(\s*0x)?[0-9a-f${separatorSymbolsString}]*`;
export const nonNegativeIntegerRegex = regex(nonNegativeIntegerString);

export const integerString = `( *${plusOrMinusClass})?${nonNegativeIntegerString}`;
export const integerRegex = regex(integerString);

/* ------------------------------ Normalization ------------------------------ */

// JavaScript's parsers cannot handle the actual minus sign and negative hexadecimal integers.
// Moreover, JavaScript has no problems with empty strings but fails on '0x'.

export function normalizeIntegerString(input: string): string {
    input = input.replace(separatorSymbolsRegex, '');
    if (plusOrMinusSymbols.includes(input.charAt(0))) {
        input = input.substring(1);
    }
    if (input === '0x') {
        input = '0x0';
    } else if (!input.startsWith('0x') && /[a-f]/i.test(input)) {
        input = '0x' + input;
    }
    return input;
}

/* ------------------------------ Integer formats ------------------------------ */

export const integerFormats = ['raw', 'decimal', 'hexadecimal'] as const;
export type IntegerFormat = typeof integerFormats[number];

export function determineIntegerFormat(input: string): IntegerFormat {
    return normalizeIntegerString(input).startsWith('0x') ? 'hexadecimal' : 'decimal';
}

/* ------------------------------ Decoding ------------------------------ */

export function decodeNumber(input: string): number {
    const output = Number(normalizeIntegerString(input));
    if (minusSymbols.includes(input.charAt(0))) {
        return output * (-1);
    } else {
        return output;
    }
}

export function decodeInteger(input: string): bigint {
    const output = BigInt(normalizeIntegerString(input));
    if (minusSymbols.includes(input.charAt(0))) {
        return output * minusOne;
    } else {
        return output;
    }
}

/* ------------------------------ Encoding ------------------------------ */

export function encodeIntegerWithoutStore(
    integer: number | bigint | ToInteger,
    format: IntegerFormat = 'decimal',
    parenthesesIfNegative: boolean = false,
    decimalSeparator: string = "'",
    hexadecimalSeparator: string = ' ',
    minusSign: string = '−',
): string {
    if (parenthesesIfNegative) {
        const output = encodeIntegerWithoutStore(integer, format, false, decimalSeparator, hexadecimalSeparator, minusSign);
        return plusOrMinusSymbols.includes(output.charAt(0)) ? '(' + output + ')' : output;
    } else {
        integer = normalizeToInteger(integer);
        switch (format) {
            case 'raw':
                return integer.toString();
            case 'decimal':
                // https://stackoverflow.com/a/2901298/12917821
                return integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, decimalSeparator).replace(/-/, minusSign);
            case 'hexadecimal':
                return (integer <= minusOne ? minusSign : '') + '0x' + integer.toString(16).replace(/\B(?=([0-9a-f]{8})+(?![0-9a-f]))/g, hexadecimalSeparator).replace(/-/, '').toUpperCase();
        }
    }
}

export function transformIntegerForCodeOutput(input: string): string {
    return decodeInteger(input).toString();
}

/* ------------------------------ Interface ------------------------------ */

export interface ToInteger {
    /**
     * Converts this object to an integer.
     */
    toInteger(): bigint;
}

export function normalizeToInteger(object: bigint | ToInteger): bigint;

export function normalizeToInteger(object: number | bigint | ToInteger): number | bigint;

export function normalizeToInteger(object: number | bigint | ToInteger): number | bigint {
    return typeof object === 'object' ? object.toInteger() : object;
}
