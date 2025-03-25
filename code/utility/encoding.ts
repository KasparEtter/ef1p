/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import createHash from 'create-hash';
import createHmac from 'create-hmac';
import { Buffer } from 'safe-buffer';

import { filterUndefined, getInitializedArray, getLastElement } from './array';
import { reverseLookup } from './record';
import { doubleQuote, normalizeNewlines, splitOutsideOfDoubleQuotes, toHex } from './string';

/* ------------------------------ Charset ------------------------------ */

// https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings
export type Charset = 'ascii' | 'latin1' | 'utf8';

// https://www.iana.org/assignments/character-sets/character-sets.xhtml
export const charsets: Record<Charset, string> = {
    'ascii': 'US-ASCII',
    'latin1': 'ISO-8859-1',
    'utf8': 'UTF-8',
}

/* ------------------------------ Base64 encoding ------------------------------ */

export const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/; // Matches also empty strings.

export function encodeBase64(text: string, charset: Charset = 'utf8'): string {
    return Buffer.from(text, charset).toString('base64');
}

/**
 * The newlines of the returned string are normalized to CR + LF.
 */
export function encodeBase64WithLineLengthLimit(text: string, charset: Charset = 'utf8', lineLength = 76): string {
    if (lineLength <= 0) {
        throw new Error('The line length has to be positive.');
    }
    const base64 = encodeBase64(text, charset);
    let result = '';
    let position = 0;
    while (position < base64.length) {
        if (position > 0) {
            result += '\r\n';
        }
        const nextPosition = position + lineLength;
        result += base64.substring(position, nextPosition);
        position = nextPosition;
    }
    return result;
}

export function decodeBase64(text: string, charset: Charset = 'utf8'): string {
    return Buffer.from(text.replace(/\s+/g, ''), 'base64').toString(charset);
}

/* ------------------------------ Authentication ------------------------------ */

export function toPlainEncoding(username: string, password: string): string {
    return encodeBase64(`\u0000${username}\u0000${password}`);
}

export function toCramMd5Encoding(username: string, password: string, challenge: string): string {
    const hmac = createHmac('md5', password);
    hmac.update(decodeBase64(challenge));
    const response = hmac.digest('hex');
    return encodeBase64(username + ' ' + response);
}

export function toApopEncoding(challenge: string, password: string): string {
    return createHash('md5').update(challenge + password).digest('hex');
}

/* ------------------------------ Character ranges ------------------------------ */

function isInRange(text: string, max: number): boolean {
    for (let i = 0; i < text.length; i++) {
        const codePoint = text.codePointAt(i);
        if (codePoint !== undefined && codePoint > max) {
            return false;
        }
    }
    return true;
}

export function isInAsciiRange(text: string): boolean {
    return isInRange(text, 127);
}

export function isInLatin1Range(text: string): boolean {
    return isInRange(text, 255);
}

export function getNodeCharset(text: string): Charset {
    if (isInAsciiRange(text)) {
        return 'ascii';
    } else if (isInLatin1Range(text)) {
        return 'latin1';
    } else {
        return 'utf8';
    }
}

export function getIanaCharset(text: string): string {
    return charsets[getNodeCharset(text)].toLowerCase();
}

/* ------------------------------ Quoted-Printable encoding ------------------------------ */

const encodeForEncodedWord = Array.from('?_\t').map(c => c.charCodeAt(0));
// See https://datatracker.ietf.org/doc/html/rfc2047#section-5 point 3
// and https://datatracker.ietf.org/doc/html/rfc5322#section-3.2.3
const encodeForDisplayName = Array.from('#$%&\'^`{|}~()<>[]:;@\\,."').map(c => c.charCodeAt(0));
const tabAndSpace = Array.from('\t ').map(c => c.charCodeAt(0));

const tab = 9;
const LF = 10;
const CR = 13;
const space = 32;
const equals = 61;

/**
 * The newlines of the returned string are normalized to CR + LF.
 */
export function encodeQuotedPrintable(text: string, charset: Charset, encodedWord = false, displayName = false, lineLimit = 73): string {
    if (encodedWord) {
        lineLimit = 0;
    }
    const buffer = Buffer.from(normalizeNewlines(text), charset);
    let result = '';
    let lineLength = 0;
    for (let i = 0; i < buffer.length; i++) {
        const charCode = buffer.readUInt8(i);
        let encoding: string;
        if (
            charCode > 126 || (charCode < 32 && ![tab, LF, CR].includes(charCode)) // Always encode most non-printable characters: https://en.wikipedia.org/wiki/ASCII#Printable_character_table
            || charCode === equals // Always encode the equals sign
            || encodedWord && encodeForEncodedWord.includes(charCode)
            || displayName && encodeForDisplayName.includes(charCode)
        ) {
            encoding = '=' + toHex(charCode, 2);
        } else if (encodedWord && charCode === space) {
            encoding = '_';
        } else {
            encoding = String.fromCharCode(charCode);
        }
        if (charCode === CR || charCode === LF) {
            lineLength = 0;
        } else {
            lineLength += encoding.length;
        }
        // The line length doesn't need to be updated for trailing whitespace.
        if (i === buffer.length - 1) {
            // Encode trailing whitespace before the end of the input.
            if (!encodedWord && tabAndSpace.includes(charCode)) {
                result += '=' + toHex(charCode, 2);
            } else {
                result += encoding;
            }
        } else {
            const nextCharCode = buffer.readUInt8(i + 1);
            // Encode trailing whitespace before the end of a line.
            if (!encodedWord && nextCharCode === CR && tabAndSpace.includes(charCode)) {
                result += '=' + toHex(charCode, 2);
            } else {
                result += encoding;
                if (lineLimit > 0 && lineLength >= lineLimit && nextCharCode !== CR) {
                    result += '=\r\n';
                    lineLength = 0;
                }
            }
        }
    }
    return result;
}

/**
 * The newlines of the returned string are normalized to CR + LF.
 */
export function encodeQuotedPrintableIfNecessary(text: string): string {
    if (isInAsciiRange(text)) {
        return normalizeNewlines(text);
    } else if (isInLatin1Range(text)) {
        return encodeQuotedPrintable(text, 'latin1');
    } else {
        return encodeQuotedPrintable(text, 'utf8');
    }
}

/**
 * The newlines of the returned string are normalized to CR + LF.
 */
export function decodeQuotedPrintable(text: string, charset: Charset, encodedWord = false): string {
    text = normalizeNewlines(text).replace(/[ \t]+$/, ''); // Remove trailing whitespace.
    const buffer = Buffer.alloc(text.length);
    let bufferPosition = 0;
    let stringPosition = 0;
    while (stringPosition < text.length) {
        const charCode = text.charCodeAt(stringPosition++);
        if (charCode === 61) { // =
            if (stringPosition > text.length - 2) { // The position is already incremented here.
                throw new Error('The encoded text must have two characters after every equality sign.');
            }
            const charCode1 = text.charCodeAt(stringPosition++);
            const charCode2 = text.charCodeAt(stringPosition++);
            if (charCode1 !== 13 || charCode2 !== 10) { // Remove inserted CR + LF.
                const hex = String.fromCharCode(charCode1, charCode2);
                if (!/^[0-9A-F]{2}$/i.test(hex)) {
                    throw new Error('Every equality sign has to be followed by two hexadecimal digits (or CR+LF).');
                }
                buffer.writeUInt8(Number.parseInt(hex, 16), bufferPosition++);
            }
        } else if (encodedWord && charCode === 95) { // _
            buffer.writeUInt8(32, bufferPosition++); // Space
        } else {
            buffer.writeUInt8(charCode, bufferPosition++);
        }
    }
    return buffer.slice(0, bufferPosition).toString(charset);
}

/* ------------------------------ Encoded-Word encoding ------------------------------ */

export function encodeEncodedWord(text: string, charset: Charset, displayName = false): string {
    const base64 = encodeBase64(text, charset);
    const quotedPrintable = encodeQuotedPrintable(text, charset, true, displayName);
    let encoding;
    let encodedWord;
    if (base64.length < quotedPrintable.length) {
        encoding = 'B';
        encodedWord = base64;
    } else {
        encoding = 'Q';
        encodedWord = quotedPrintable;
    }
    const result = `=?${charsets[charset]}?${encoding}?${encodedWord}?=`;
    if (result.length > 75) {
        // By converting the text to an array of Unicode characters,
        // we prevent that a Unicode character is being split,
        // which is not allowed by the standard.
        const chars = Array.from(text);
        const index = Math.ceil(chars.length / 2);
        return encodeEncodedWord(chars.slice(0, index).join(''), charset, displayName) + '\r\n '
             + encodeEncodedWord(chars.slice(index).join(''), charset, displayName);
    } else {
        return result;
    }
}

// https://datatracker.ietf.org/doc/html/rfc2047#section-7
function containsEncodedWord(text: string): boolean {
    return text.split(/\s+/).some(part => /^=\?.*\?=$/.test(part));
}

export function encodeEncodedWordIfNecessary(text: string): string {
    const charset = getNodeCharset(text);
    if (charset !== 'ascii' || containsEncodedWord(text)) {
        return encodeEncodedWord(text, charset);
    } else {
        return text;
    }
}

// https://datatracker.ietf.org/doc/html/rfc2231#section-5
// https://en.wikipedia.org/wiki/ASCII#Printable_characters
const encodedWordRegex = /^=\?(UTF-8|ISO-8859-1|US-ASCII)(\*[-a-z0-9]+)?\?(B\?[A-Z0-9\+/]*=?=?|Q\?([\x21-\x3C\x3E\x40-\x7E]*(=[0-9A-F]{2})?)*)\?=$/i;

export function decodeEncodedWord(text: string): string {
    const parts = text.split(/\s+/);
    let match = true;
    let result = '';
    for (let i = 0; i < parts.length; i++) {
        if (encodedWordRegex.test(parts[i])) {
            if (!match) {
                result += ' ';
            }
            match = true;
            const tokens = parts[i].split('?');
            const charset = reverseLookup(charsets, tokens[1].toUpperCase()) as Charset;
            const encoding = tokens[2].toUpperCase();
            const encodedWord = tokens[3];
            if (encoding === 'B') {
                result += decodeBase64(encodedWord, charset);
            } else {
                result += decodeQuotedPrintable(encodedWord, charset, true);
            }
        } else {
            if (i > 0) {
                result += ' ';
            }
            result += parts[i];
            match = false;
        }
    }
    return result;
}

/* ------------------------------ Extended-Parameter encoding ------------------------------ */

function quoteIfNecessary(text: string): string {
    // https://datatracker.ietf.org/doc/html/rfc2045#section-5.1
    return (/[ \n\r\t()<>@,;:\\"/[\]?=]/.test(text) || !isInAsciiRange(text)) ? doubleQuote(text) : text;
}

// https://datatracker.ietf.org/doc/html/rfc2231#section-7 and https://datatracker.ietf.org/doc/html/rfc2045#section-5.1
const forbidden = Array.from(`*'%()<>@,;:\\"/[]?=`, character => character.charCodeAt(0));

function encodeParameterValue(value: string, charset: Charset): string {
    let result = '';
    const buffer = Buffer.from(value, charset);
    for (let i = 0; i < buffer.length; i++) {
        const charCode = buffer.readUInt8(i);
        if (charCode > 126 || charCode < 33 || forbidden.includes(charCode)) {
            result += '%' + toHex(charCode, 2);
        } else {
            result += String.fromCharCode(charCode);
        }
    }
    return charsets[charset].toLowerCase() + "''" + result;
}

export function encodeExtendedParameters(text: string): string {
    let result = '';
    const parameters = splitOutsideOfDoubleQuotes(text, ';', true);
    for (const parameter of parameters) {
        if (parameter.length === 0) {
            continue;
        }
        if (result.length > 0) {
            result += ';\n';
        }
        const index = parameter.indexOf('=');
        if (index === -1) {
            result += parameter;
        } else {
            const name = parameter.substring(0, index);
            if (/^[-a-z0-9]+$/i.test(name)) {
                const quotedValue = parameter.substring(index + 1);
                const value = quotedValue.startsWith('"') && quotedValue.endsWith('"') ? quotedValue.slice(1, -1) : quotedValue;
                const charset = getNodeCharset(value);
                if (charset === 'ascii') {
                    result += name + '=' + quoteIfNecessary(value);
                } else {
                    result += name + '*=' + encodeParameterValue(value, charset);
                }
            } else {
                result += parameter;
            }
        }
    }
    return result;
}

const percentCode = '%'.charCodeAt(0);

function decodeOtherParameterValue(value: string, charset: Charset): string {
    const buffer = Buffer.alloc(value.length);
    let bufferPosition = 0;
    let stringPosition = 0;
    while (stringPosition < value.length) {
        const charCode = value.charCodeAt(stringPosition++);
        if (charCode === percentCode && stringPosition < value.length - 1) { // The position is already incremented here.
            const charCode1 = value.charCodeAt(stringPosition++);
            const charCode2 = value.charCodeAt(stringPosition++);
            const hex = String.fromCharCode(charCode1, charCode2);
            if (/^[0-9A-F]{2}$/i.test(hex)) {
                buffer.writeUInt8(Number.parseInt(hex, 16), bufferPosition++);
            } else {
                buffer.writeUInt8(percentCode, bufferPosition++);
                buffer.writeUInt8(charCode1, bufferPosition++);
                buffer.writeUInt8(charCode2, bufferPosition++);
            }
        } else {
            buffer.writeUInt8(charCode, bufferPosition++);
        }
    }
    return buffer.slice(0, bufferPosition).toString(charset);
}

function decodeInitialParameterValue(value: string): [string, Charset] {
    const parts = value.split(`'`);
    const charset = reverseLookup(charsets, parts[0].toUpperCase()) as Charset | undefined ?? 'utf8';
    return [decodeOtherParameterValue(getLastElement(parts), charset), charset];
}

export function decodeExtendedParameters(text: string): string {
    let result = '';
    const continuations: { [key: string]: ({ encoded: boolean, value: string } | undefined)[] } = {};
    const parameters = splitOutsideOfDoubleQuotes(text, ';', true);
    for (const parameter of parameters) {
        if (parameter.length === 0) {
            continue;
        }
        let current = '';
        const index = parameter.indexOf('=');
        if (index === -1) {
            current = parameter;
        } else {
            const name = parameter.substring(0, index).trim();
            if (/^[-a-z0-9*]+$/i.test(name)) {
                const quotedValue = parameter.substring(index + 1).trim();
                const value = quotedValue.startsWith('"') && quotedValue.endsWith('"') ? quotedValue.slice(1, -1) : quotedValue;
                const parts = name.split('*');
                if ((parts.length === 2 || parts.length === 3 && parts[2].length === 0) && /^\d+$/.test(parts[1])) {
                    getInitializedArray(continuations, parts[0])[Number.parseInt(parts[1], 10)] = { encoded: parts.length === 3, value };
                } else if (parts.length === 2 && parts[1].length === 0) {
                    current = parts[0] + '=' + quoteIfNecessary(decodeInitialParameterValue(value)[0]);
                } else {
                    current = name + '=' + quoteIfNecessary(value);
                }
            } else {
                current = parameter;
            }
        }
        if (current.length > 0) {
            if (result.length > 0) {
                result += ';\n';
            }
            result += current;
        }
    }
    for (const name of Object.keys(continuations)) {
        let value = '';
        const fragments = filterUndefined(continuations[name]);
        if (fragments[0].encoded) {
            const first = decodeInitialParameterValue(fragments[0].value);
            value += first[0];
            const charset = first[1];
            for (let i = 1; i < fragments.length; i++) {
                value += fragments[i].encoded ? decodeOtherParameterValue(fragments[i].value, charset) : fragments[i].value;
            }
        } else {
            for (const fragment of fragments) {
                value += fragment.value;
            }
        }
        if (result.length > 0) {
            result += ';\n';
        }
        result += name + '=' + quoteIfNecessary(value);
    }
    return result;
}
