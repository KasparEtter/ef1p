/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { DetermineButton, DynamicBooleanEntry, DynamicTextEntry, InputError } from '../../react/entry';

import { curvePointRegex, EllipticCurve, EllipticCurveElement, maxModulusForPointCounting } from '../../math/elliptic-curve';
import { encodeInteger } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat, transformIntegerForCodeOutput } from '../../math/integer';
import { MultiplicativeRing } from '../../math/multiplicative-ring';
import { getNextPrime, getPreviousPrime, isProbablePrime } from '../../math/prime';
import { four, hundred, max, min, three, two, zero } from '../../math/utility';

import { determineNextPrimeInteger, determinePreviousPrimeInteger, integer, integerGreaterOne, integerInputWidth, nonNegativeInteger, primeInteger } from './integer';

/* ------------------------------ Modulus ------------------------------ */

// There are no dependencies, but the following restrictions shall
// not disable 'onUpOrDown' and the determine buttons.
function validateModulusDependently(modulus: string): InputError {
    const integer = decodeInteger(modulus);
    if (!isProbablePrime(integer)) {
        return 'This integer is not prime.';
    } else if (integer === two) {
        return 'The modulus has to be odd.';
    } else {
        return false;
    }
}

const determinePreviousOddPrimeInteger: DetermineButton<string> = {
    ...determinePreviousPrimeInteger,
    tooltip: 'Determines the next lower odd prime number.',
    disable: input => decodeInteger(input) <= three,
}

/**
 * Odd prime modulus of arbitrary length.
 * The modulus has to be odd for the Tonelli-Shanks algorithm to work without special cases.
 */
export const p: DynamicTextEntry = {
    ...primeInteger,
    label: 'Modulus p',
    tooltip: 'The odd modulus of the prime field over which the elliptic curve is defined.',
    defaultValue: '19',
    transform: transformIntegerForCodeOutput,
    stayEnabled: true,
    validateDependently: validateModulusDependently,
    onUpOrDown: (event, input) => encodeInteger(event === 'up' ? getNextPrime(decodeInteger(input)) : max(getPreviousPrime(decodeInteger(input)), three), determineIntegerFormat(input)),
    determine: [determineNextPrimeInteger, determinePreviousOddPrimeInteger],
};

/* ------------------------------ Modulus below 100 ------------------------------ */

// There are no dependencies, but the following restrictions shall
// not disable 'onUpOrDown' and the determine buttons.
function validateModulusBelow100Dependently(modulus: string): InputError {
    const integer = decodeInteger(modulus);
    if (!isProbablePrime(integer)) {
        return 'This integer is not prime.';
    } else if (integer === two) {
        return 'The modulus has to odd.';
    } else if (integer > hundred) {
        return 'The modulus may not be larger than 100.';
    } else {
        return false;
    }
}

const ninetySeven = BigInt(97);

const determineNextPrimeIntegerBelow100: DetermineButton<string> = {
    ...determineNextPrimeInteger,
    disable: input => decodeInteger(input) >= ninetySeven,
}

const determinePreviousOddPrimeIntegerBelow100: DetermineButton<string> = {
    ...determinePreviousOddPrimeInteger,
    onClick: async input => encodeInteger(min(getPreviousPrime(decodeInteger(input)), ninetySeven), determineIntegerFormat(input)),
}

export const modulusBelow100: DynamicTextEntry = {
    ...p,
    defaultValue: '7',
    validateDependently: validateModulusBelow100Dependently,
    onUpOrDown: (event, input) => encodeInteger(min(event === 'up' ? getNextPrime(decodeInteger(input)) : max(getPreviousPrime(decodeInteger(input)), three), ninetySeven), determineIntegerFormat(input)),
    determine: [determineNextPrimeIntegerBelow100, determinePreviousOddPrimeIntegerBelow100],
};

/* ------------------------------ Elliptic curve state ------------------------------ */

export interface EllipticCurveState {
    p: string;
    a: string;
    b: string;
}

function validateCurveParameter(_: unknown, inputs: EllipticCurveState): InputError {
    const p = decodeInteger(inputs.p);
    const a = decodeInteger(inputs.a);
    const b = decodeInteger(inputs.b);
    return (four * a * a * a + BigInt(27) * b * b) % p === zero && '4a^3 + 27b^2 may not be 0.';
}

export const a: DynamicTextEntry<EllipticCurveState> = {
    ...integer,
    label: 'Parameter a',
    tooltip: 'The parameter a of the elliptic curve equation y^2 = x^3 + ax + b.',
    defaultValue: '−1',
    transform: transformIntegerForCodeOutput,
    stayEnabled: true,
    // Uncommenting the following two lines moves the error from parameter b to parameter a.
    // dependencies: ['p', 'b'],
    // validateDependently: validateCurveParameter,
};

export const b: DynamicTextEntry<EllipticCurveState> = {
    ...integer,
    label: 'Parameter b',
    tooltip: 'The parameter b of the elliptic curve equation y^2 = x^3 + ax + b.',
    defaultValue: '4',
    transform: transformIntegerForCodeOutput,
    stayEnabled: true,
    dependencies: ['p', 'a'],
    validateDependently: validateCurveParameter,
};

const ellipticCurveCache: { [key: string]: EllipticCurve | undefined } = {};

/**
 * This function requires that the modulus and both parameters are fully valid.
 */
export function getEllipticCurve({ p, a, b }: EllipticCurveState): EllipticCurve {
    const identifier = [p, a, b].join('|');
    let ellipticCurve = ellipticCurveCache[identifier];
    if (ellipticCurve === undefined) {
        const field = MultiplicativeRing.fromPrime(decodeInteger(p));
        ellipticCurve = new EllipticCurve(field, field.getElement(decodeInteger(a)), field.getElement(decodeInteger(b)));
        ellipticCurveCache[identifier] = ellipticCurve;
    }
    return ellipticCurve;
}

/* ------------------------------ Generic points ------------------------------ */

function onUpOrDownAx(event: 'up' | 'down', input: string, inputs: EllipticCurveState): string {
    let x = MultiplicativeRing.fromPrime(decodeInteger(inputs.p)).getElementFromString(input);
    const ellipticCurve = getEllipticCurve(inputs);
    do {
        x = x.getNextOrPreviousElement(event === 'up');
    } while (ellipticCurve.getElements(x) === undefined);
    return x.to(determineIntegerFormat(input));
}

const generateRandomXCoordinate: DetermineButton<string, EllipticCurveState> = {
    label: 'Random',
    tooltip: 'Generates a random x coordinate of the elliptic curve.',
    requireValidDependencies: true,
    requireIndependentlyValidInput: true,
    onClick: async (input, inputs) => getEllipticCurve(inputs).getRandomElement().x.to(determineIntegerFormat(input)),
}

export const Ax: DynamicTextEntry<EllipticCurveState> = {
    ...nonNegativeInteger,
    label: 'A x value',
    tooltip: 'The x coordinate of the point you are interested in.',
    defaultValue: '8',
    transform: transformIntegerForCodeOutput,
    inputWidth: integerInputWidth - 72,
    dependencies: ['p', 'a', 'b'],
    validateDependently: (input, inputs) => decodeInteger(input) >= decodeInteger(inputs.p) && 'This value may not be greater than the modulus.' ||
        getEllipticCurve(inputs).getElementFromStringX(input) === undefined && 'There is no point with this x coordinate.',
    derive: (inputs, input) => decodeInteger(input) >= decodeInteger(inputs.p) || getEllipticCurve(inputs).getElementFromStringX(input) === undefined ?
        getEllipticCurve(inputs).getRandomElement().x.to(determineIntegerFormat(input)) : input,
    onUpOrDown: onUpOrDownAx,
    determine: generateRandomXCoordinate,
};

export const Ay: DynamicBooleanEntry = {
    label: 'A y even',
    tooltip: 'Whether you want the point with the even y coordinate.',
    defaultValue: true,
    inputType: 'checkbox',
};

export const A: DynamicTextEntry<EllipticCurveState> = {
    label: 'Curve point',
    tooltip: 'A point on the curve in the format (x, y). If you use the comma as a decimal separator, the format has to be (x; y).',
    defaultValue: '(4, 2)',
    inputType: 'text',
    inputWidth: integerInputWidth,
    dependencies: ['p', 'a', 'b'],
    validateIndependently: input => !curvePointRegex.test(input) && 'This is not a curve point.',
    validateDependently: (input, inputs) => !getEllipticCurve(inputs).areValidCoordinatesFromString(input) && 'This point is not on the curve.',
};

/* ------------------------------ Generator ------------------------------ */

export interface EllipticCurveStateWithGenerator extends EllipticCurveState {
    Gx: string;
    Gy: boolean;
}

export const Gx: DynamicTextEntry<EllipticCurveStateWithGenerator> = {
    ...Ax,
    label: 'G x value',
    defaultValue: '1',
    stayEnabled: true,
};

export const Gy: DynamicBooleanEntry<EllipticCurveStateWithGenerator> = {
    ...Ay,
    label: 'G y even',
};

export function getGenerator(state: Readonly<EllipticCurveStateWithGenerator>): EllipticCurveElement {
    return getEllipticCurve(state).getElementFromStringX(state.Gx, state.Gy)!;
}

export const n: DynamicTextEntry<EllipticCurveStateWithGenerator> = {
    ...integerGreaterOne,
    label: "G's order n",
    tooltip: 'The order of the generator G.',
    defaultValue: '23',
    dependencies: ['p', 'a', 'b', 'Gx'],
    validateDependently: (input, inputs) => decodeInteger(input) < two && 'The order has to be at least 2.' ||
        !getGenerator(inputs).repeat(decodeInteger(input)).isIdentity() && 'The generator does not have this order.' ||
        decodeInteger(inputs.p) < maxModulusForPointCounting && decodeInteger(input) > getEllipticCurve(inputs).getRepetitionOrder()! && 'The order may not be greater than the size of the group.',
    derive: inputs => encodeInteger(getGenerator(inputs).getOrder(), determineIntegerFormat(inputs.p)),
};
