/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { DetermineButton, DynamicTextEntry } from '../../react/entry';

import { decodeInteger, determineIntegerFormat } from '../../math/integer';
import { MultiplicativeGroup, MultiplicativeGroupElement } from '../../math/multiplicative-group';
import { two } from '../../math/utility';

import { determinePrimeIntegers, integerGreaterOne, integerInputWidth } from '../utility/integer';

/* ------------------------------ Modulus ------------------------------ */

/**
 * Modulus greater than one of arbitrary length with no other restrictions.
 */
export const m: DynamicTextEntry = {
    ...integerGreaterOne,
    label: 'Modulus m',
    tooltip: 'The modulus of the multiplicative group.',
    defaultValue: '97',
    inputWidth: integerInputWidth / 3,
    stayEnabled: true,
    determine: determinePrimeIntegers,
};

export interface MultiplicativeGroupState {
    m: string;
}

/* ------------------------------ Element ------------------------------ */

const generateRandomElement: DetermineButton<string, MultiplicativeGroupState> = {
    label: 'Random',
    tooltip: 'Generates a random element of the multiplicative group.',
    requireValidDependencies: true,
    requireIndependentlyValidInput: true,
    onClick: async (input, { m }) => new MultiplicativeGroup(decodeInteger(m)).getRandomElement().to(determineIntegerFormat(input)),
}

export function getElement(input: string, inputs: Readonly<MultiplicativeGroupState>): MultiplicativeGroupElement {
    return new MultiplicativeGroup(decodeInteger(inputs.m)).getElementFromString(input);
}

/**
 * A group element greater than 1 so that its order is at least 2.
 */
export const A: DynamicTextEntry<MultiplicativeGroupState> = {
    ...integerGreaterOne,
    label: 'Element A',
    tooltip: 'An integer which is coprime with the group modulus.',
    defaultValue: '56',
    inputWidth: 145,
    dependencies: 'm',
    validateDependently: (input, inputs) => decodeInteger(input) < two && 'The element has to be at least 2.' ||
        decodeInteger(input) >= decodeInteger(inputs.m) && 'The element has to smaller than the modulus.' ||
        !getElement(input, inputs).isCoprimeWithModulus() && 'The element has to be coprime with the modulus.',
    derive: (inputs, input) => decodeInteger(input) >= decodeInteger(inputs.m) || !getElement(input, inputs).isCoprimeWithModulus() ?
        new MultiplicativeGroup(decodeInteger(inputs.m)).getRandomElement().to(determineIntegerFormat(input)) : input,
    requireValidDependenciesForUpOrDown: true,
    onUpOrDown: (event, input, inputs) => getElement(input, inputs).getNextOrPreviousElement(event === 'up').to(determineIntegerFormat(input)),
    determine: generateRandomElement,
};
