/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import punycode from 'punycode/'; // Refers to Node's deprecated library without the trailing slash.

import { countOccurrences, regex } from '../../utility/string';

import { DynamicBooleanEntry, DynamicEntries, DynamicTextEntry, validateByTrial } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Conversion ------------------------------ */

// A very crude approximation of the IDNA2008 rules: https://datatracker.ietf.org/doc/html/rfc5894#section-3.1.3
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes
// Unicode categories: https://www.regular-expressions.info/unicode.html
// See also https://mathiasbynens.be/notes/es-unicode-property-escapes#word
// and https://github.com/mathiasbynens/regexpu-core for transpiling the property escapes.
export const unicodeDomainRegexString = '([\\p{Letter}\\p{Number}][\\p{Letter}\\p{Mark}\\p{Number}\\p{Join_Control}]*(-+[\\p{Letter}\\p{Number}][\\p{Letter}\\p{Mark}\\p{Number}\\p{Join_Control}]*)*(\\.[\\p{Letter}\\p{Number}][\\p{Letter}\\p{Mark}\\p{Number}\\p{Join_Control}]*(-+[\\p{Letter}\\p{Number}][\\p{Letter}\\p{Mark}\\p{Number}\\p{Join_Control}]*)*)*\\.?)?';
export const unicodeDomainRegex = regex(unicodeDomainRegexString);

export function encodePunycode(text: string, domain = true): string {
    if (domain) {
        if (!unicodeDomainRegex.test(text)) {
            throw new Error('This is not a valid domain name.');
        } else {
            const lowercase = text.toLowerCase();
            const normalized = lowercase.normalize('NFKC');
            if (countOccurrences(lowercase, /\./g) !== countOccurrences(normalized, /\./g)) {
                throw new Error('The normalization of a domain character includes a dot.');
            } else {
                const encoded = punycode.toASCII(normalized);
                if (encoded.split('.').some(label => label.length > 63)) {
                    throw new Error('One of the encoded domain labels is too long.');
                }
                return encoded;
            }
        }
    } else {
        return punycode.encode(text);
    }
}

function encode(input: string, inputs: Readonly<State>): Partial<State> {
    return { encoded: encodePunycode(input, inputs.domain) };
}

export function decodePunycode(text: string, domain = true): string {
    try {
        return domain ? punycode.toUnicode(text) : punycode.decode(text);
    } catch (error) {
        throw new Error('This is not a valid Punycode encoding.');
    }
}

function decode(input: string, inputs: Readonly<State>): Partial<State> {
    return { decoded: decodePunycode(input, inputs.domain) };
}

/* ------------------------------ Input ------------------------------ */

const inputWidth = 235;

const decoded: DynamicTextEntry<State> = {
    label: 'Decoded',
    tooltip: 'The decoded Unicode string.',
    defaultValue: 'Zürich',
    inputType: 'text',
    inputWidth,
    validateDependently: validateByTrial(encode),
    updateOtherInputsOnInput: encode,
};

const encoded: DynamicTextEntry<State> = {
    label: 'Encoded',
    tooltip: 'The encoded Punycode string.',
    defaultValue: 'Zrich-kva',
    inputType: 'text',
    inputWidth,
    validateDependently: validateByTrial(decode),
    updateOtherInputsOnInput: decode,
};

const domain: DynamicBooleanEntry<State> = {
    label: 'Domain',
    tooltip: 'Whether to encode/decode the string as a domain name.',
    defaultValue: false,
    inputType: 'switch',
    triggerOtherInputOnInput: 'decoded',
};

interface State {
    decoded: string;
    encoded: string;
    domain: boolean;
}

const entries: DynamicEntries<State> = {
    decoded,
    encoded,
    domain,
};

const store = new VersionedStore(entries, 'encoding-punycode');
const Input = getInput(store);

/* ------------------------------ Tool ------------------------------ */

export const toolEncodingPunycode: Tool = [<Input/>, store];
