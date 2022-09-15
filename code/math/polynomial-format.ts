/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { mapEntries } from '../utility/object';
import { arrayToRecord } from '../utility/record';
import { capitalizeFirstLetter, regex } from '../utility/string';

import { minusRegex, plusOrMinusClass } from './integer';

// The following code is in a separate file so that polynomial.tsx and ring.tsx don't form a circular dependency.

export const polynomialFormats = ['polynomial', 'vector', 'decimal', 'binary', 'hexadecimal'] as const;
export type PolynomialFormat = typeof polynomialFormats[number];
export const polynomialFormatOptions = mapEntries(arrayToRecord<string>(polynomialFormats), capitalizeFirstLetter);

const vectorCoefficient = `${plusOrMinusClass}?\\d+`;

export const vectorString = `${vectorCoefficient}(( *, *| +)${vectorCoefficient})*`;
export const vectorRegex = regex(vectorString);

export function splitVector(text: string): string[] {
    return text.replace('[', '').replace(']', '').trim().replace(/,/g, ' ').replace(/ {2,}/g, ' ').replace(minusRegex, '-').split(' ');
}

const vectorWithSeveralCoefficients = `${vectorCoefficient}(( *, *| +)${vectorCoefficient})+`;
export const vectorWithSeveralCoefficientsRegex = regex(`(\\[ *${vectorWithSeveralCoefficients} *\\]|${vectorWithSeveralCoefficients})`);

const variable = `[a-z]`;
export const variableRegex = new RegExp(variable);

const monomialCoefficient = `({[0-9]+}|[0-9]+)`;
const variableWithExponent = `${variable}(\\^?[0-9]+)?`;
const monomial = `(${monomialCoefficient} *\\*? *${variableWithExponent}|${monomialCoefficient}|${variableWithExponent})`;

export const formatString: { [key in PolynomialFormat]: string } = {
    hexadecimal: `0x[0-9a-f]+`,
    binary: `0b[01]+`,
    decimal: `\\d+`,
    vector: `(\\[ *${vectorString} *\\]|${vectorString})`,
    polynomial: `${plusOrMinusClass}? *${monomial}( *${plusOrMinusClass} *${monomial})*`,
};

export const formatRegex = mapEntries(formatString, input => regex(input));

export const polynomialString = ` *(${Object.values(formatString).join('|')}) *`;
export const polynomialRegex = regex(polynomialString);

export const extensionsString = `(${polynomialString}(\\n${polynomialString})*)?\\n*`;
export const extensionsRegex = regex(extensionsString);

export function determinePolynomialFormat(input: string): PolynomialFormat {
    input = input.trim();
    for (const [key, value] of Object.entries(formatRegex)) {
        if (value.test(input)) {
            return key as PolynomialFormat;
        }
    }
    throw new Error(`polynomial.tsx: Could not determine the format of '${input}'.`);
}
