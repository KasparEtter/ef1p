/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { DetermineButton, DynamicTextEntry } from '../../react/entry';

import { encodeInteger } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat, integerRegex, nonNegativeIntegerRegex } from '../../math/integer';
import { getNextPrime, getPreviousPrime, isProbablePrime } from '../../math/prime';
import { max, minusOne, one, two, zero } from '../../math/utility';

/* ------------------------------ Integer ------------------------------ */

export const integerInputWidth = 305;
export const shortIntegerInputWidth = integerInputWidth - 125;

export const integer: DynamicTextEntry = {
    label: 'Integer',
    tooltip: 'A positive or negative integer of arbitrary length.',
    defaultValue: '15',
    inputType: 'text',
    inputWidth: integerInputWidth,
    validateIndependently: input => !integerRegex.test(input) && 'This is not an integer.',
    validateIndependentlyOnInput: true,
    onUpOrDown: (event, input) => encodeInteger(decodeInteger(input) + (event === 'up' ? one : minusOne), determineIntegerFormat(input)),
};

export const nonNegativeInteger: DynamicTextEntry = {
    ...integer,
    tooltip: 'A non-negative integer of arbitrary length.',
    validateIndependently: input => !nonNegativeIntegerRegex.test(input) && 'This is not a non-negative integer.',
    onUpOrDown: (event, input) => encodeInteger(max(decodeInteger(input) + (event === 'up' ? one : minusOne), zero), determineIntegerFormat(input)),
};

export const positiveInteger: DynamicTextEntry = {
    ...integer,
    tooltip: 'A positive integer of arbitrary length.',
    validateIndependently: input => !nonNegativeIntegerRegex.test(input) && 'This is not a positive integer.',
    validateDependently: input => decodeInteger(input) < one && 'The integer has to be greater than 0.', // This allows the field to be empty during input.
    onUpOrDown: (event, input) => encodeInteger(max(decodeInteger(input) + (event === 'up' ? one : minusOne), one), determineIntegerFormat(input)),
};

export const integerGreaterOne: DynamicTextEntry = {
    ...positiveInteger,
    tooltip: 'An integer greater than one of arbitrary length.',
    validateDependently: input => decodeInteger(input) < two && 'The integer has to be at least 2.', // This allows the field to be empty during input.
    onUpOrDown: (event, input) => encodeInteger(max(decodeInteger(input) + (event === 'up' ? one : minusOne), two), determineIntegerFormat(input)),
};

/* ------------------------------ Prime ------------------------------ */

export const determineNextPrimeInteger: DetermineButton<string> = {
    label: 'Next prime',
    tooltip: 'Determines the next higher prime number.',
    requireIndependentlyValidInput: true,
    onClick: async input => encodeInteger(getNextPrime(decodeInteger(input)), determineIntegerFormat(input)),
}

export const determinePreviousPrimeInteger: DetermineButton<string> = {
    label: 'Previous prime',
    tooltip: 'Determines the next lower prime number.',
    requireIndependentlyValidInput: true,
    onClick: async input => encodeInteger(getPreviousPrime(decodeInteger(input)), determineIntegerFormat(input)),
    disable: input => decodeInteger(input) <= two,
}

export const determinePrimeIntegers = [determineNextPrimeInteger, determinePreviousPrimeInteger];

export const primeInteger: DynamicTextEntry = {
    ...positiveInteger,
    label: 'Prime',
    tooltip: 'A prime integer of arbitrary length.',
    defaultValue: '2',
    inputWidth: integerInputWidth / 3,
    validateDependently: input => !isProbablePrime(decodeInteger(input)) && 'This integer is not prime.', // Dependent validation in order not to prevent 'onUpOrDown'.
    onUpOrDown: (event, input) => encodeInteger(event === 'up' ? getNextPrime(decodeInteger(input)) : getPreviousPrime(decodeInteger(input)), determineIntegerFormat(input)),
    determine: determinePrimeIntegers,
};
