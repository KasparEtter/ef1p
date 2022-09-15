/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

export const minusOne = BigInt(-1);
export const zero = BigInt(0);
export const one = BigInt(1);
export const two = BigInt(2);
export const three = BigInt(3);
export const four = BigInt(4);
export const five = BigInt(5);
export const six = BigInt(6);
export const seven = BigInt(7);
export const eight = BigInt(8);
export const nine = BigInt(9);
export const ten = BigInt(10);
export const eleven = BigInt(11);
export const twelve = BigInt(12);
export const thirtytwo = BigInt(32);
export const hundred = BigInt(100);
export const thousand = BigInt(1000);

export function isEven(integer: bigint): boolean {
    // tslint:disable-next-line:no-bitwise
    return (integer & one) === zero;
}

export function isOdd(integer: bigint): boolean {
    // tslint:disable-next-line:no-bitwise
    return (integer & one) === one;
}

export function halve(integer: bigint): bigint {
    // tslint:disable-next-line:no-bitwise
    return integer >> one;
}

export function halveRoundedUp(integer: bigint): bigint {
    // tslint:disable-next-line:no-bitwise
    return (integer >> one) + (integer & one);
}

export function double(integer: bigint): bigint {
    // tslint:disable-next-line:no-bitwise
    return integer << one;
}

/**
 * Computes the modulo of the given dividend and divisor.
 * JavaScript allows the remainder to be negative.
 * https://en.wikipedia.org/wiki/Modulo_operation
 */
export function modulo(dividend: bigint, modulus: bigint): bigint {
    if (modulus < one) {
        throw new Error(`math/utility.ts: The modulus has to be positive but was ${modulus}.`);
    }
    const remainder = dividend % modulus;
    if (remainder < zero) {
        return remainder + modulus;
    } else {
        return remainder;
    }
}

export function abs(integer: bigint): bigint {
    return integer < zero ? -integer : integer;
}

export function max(...integers: bigint[]): bigint {
    return integers.reduce((a, b) => b > a ? b : a);
}

export function min(...integers: bigint[]): bigint {
    return integers.reduce((a, b) => b < a ? b : a);
}

// https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method
export function sqrt(integer: bigint): bigint {
    if (integer < zero) {
        throw new Error(`math/utility.ts: The integer has to be positive but was ${integer}.`);
    }
    if (integer === zero) {
        return zero;
    }
    let x0 = minusOne;
    let x1 = one;
    while (x0 !== x1 && x0 !== x1 - one) {
        x0 = x1;
        x1 = halve(integer / x0 + x0);
    }
    return x1;
}

/**
 * Computes the greatest common divisor of two non-negative integers.
 * https://en.wikipedia.org/wiki/Euclidean_algorithm#Implementations
 */
export function greatestCommonDivisor(a: bigint, b: bigint): bigint {
    if (a < zero || b < zero) {
        throw new Error(`The greatest common divisor can be computed only for non-negative numbers, but one of them was ${min(a, b)}.`);
    }
    while (b !== zero) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

/**
 * Returns whether two non-negative integers are coprime.
 */
export function areCoprime(a: bigint, b: bigint): boolean {
    return greatestCommonDivisor(a, b) === one;
}

/**
 * Computes the least common multiple of two positive integers.
 */
export function leastCommonMultiple(a: bigint, b: bigint): bigint {
    return a * b / greatestCommonDivisor(a, b);
}

/**
 * Returns the multiplicative inverse of the value modulo the modulus.
 * https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Modular_integers
 */
export function multiplicativeInverse(value: bigint, modulus: bigint): bigint {
    if (value <= zero) {
        throw new Error(`The first argument has to be a positive number but was ${value}.`);
    }
    if (modulus <= value) {
        throw new Error(`The modulus has to be larger than the value ${value} but was ${modulus}.`);
    }
    let oldRemainder = modulus;
    let newRemainder = value;
    let oldCoefficient = zero;
    let newCoefficient = one;
    while (newRemainder !== zero) {
        const quotient = oldRemainder / newRemainder;
        [oldRemainder, newRemainder] = [newRemainder, oldRemainder - quotient * newRemainder];
        [oldCoefficient, newCoefficient] = [newCoefficient, oldCoefficient - quotient * newCoefficient];
    }
    if (oldRemainder === one) {
        return modulo(oldCoefficient, modulus);
    } else {
        throw new Error(`${value} has no multiplicative inverse modulo ${modulus}.`);
    }
}

/**
 * Returns the coefficients and the greatest common divisor of Bézout's identity.
 * https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity
 */
export function bezoutsIdentity(a: bigint, b: bigint): [bigint, bigint, bigint] {
    if (a < zero || b < zero) {
        throw new Error(`Bézout's identity can be computed only for non-negative numbers, but one of them was ${min(a, b)}.`);
    }
    let oldRemainder = a;
    let newRemainder = b;
    let oldCoefficientA = one;
    let newCoefficientA = zero;
    let oldCoefficientB = zero;
    let newCoefficientB = one;
    while (newRemainder !== zero) {
        const quotient = oldRemainder / newRemainder;
        [oldRemainder, newRemainder] = [newRemainder, oldRemainder - quotient * newRemainder];
        [oldCoefficientA, newCoefficientA] = [newCoefficientA, oldCoefficientA - quotient * newCoefficientA];
        [oldCoefficientB, newCoefficientB] = [newCoefficientB, oldCoefficientB - quotient * newCoefficientB];
    }
    return [oldCoefficientA, oldCoefficientB, oldRemainder];
}

/**
 * Returns the solution [m, x] to the given Chinese remainder problem.
 */
export function chineseRemainder(mr1: [bigint, bigint], mr2: [bigint, bigint]): [bigint, bigint] {
    const [n1, n2, gcd] = bezoutsIdentity(mr2[0], mr1[0]);
    if (gcd !== one) {
        throw new Error(`The moduli ${mr1[0]} and ${mr2[0]} have to be coprime with one another but their greatest common divisor is ${gcd}.`);
    }
    const m = mr1[0] * mr2[0];
    return [m, modulo(mr1[1] * n1 * mr2[0] + mr2[1] * n2 * mr1[0], m)];
}

/**
 * Both the lower and the upper bound are inclusive.
 */
export function getRandomInteger(lower: bigint, upper: bigint): bigint {
    if (upper < lower) {
        throw new Error(`math/utlity.ts: The upper bound ${upper} may not be smaller than the lower bound ${lower}.`);
    }
    const inclusiveDifference = upper - lower + one;
    const numberOfBytes = Math.ceil(inclusiveDifference.toString(2).length / 8) + 1; // + 1 to reduce the skew of the modulo.
    const randomBytes = new Uint8Array(numberOfBytes);
    window.crypto.getRandomValues(randomBytes);
    const randomNumber = BigInt('0x' + Array.from(randomBytes, randomByte => randomByte.toString(16).padStart(2, '0')).join(''));
    return lower + randomNumber % inclusiveDifference;
}

/**
 * Returns a random integer which is coprime with the order.
 * Both the lower and the upper bound are inclusive.
 */
export function getRandomCoprimeInteger(lower: bigint, upper: bigint, order: bigint): bigint {
    let result;
    do {
        result = getRandomInteger(lower, upper);
    } while (!areCoprime(order, result));
    return result;
}

/**
 * Adapted from https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 * by removing the division at the end and returning a bigint instead.
 */
export function mulberry32(a: number) {
    return () => {
      // tslint:disable:no-bitwise
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return BigInt((t ^ t >>> 14) >>> 0);
    }
}

/**
 * Both the lower and the upper bound are inclusive.
 */
export function getPseudoRandomInteger(lower: bigint, upper: bigint, prng: () => bigint): bigint {
    if (upper < lower) {
        throw new Error(`math/utlity.ts: The upper bound ${upper} may not be smaller than the lower bound ${lower}.`);
    }
    const inclusiveDifference = upper - lower + one;
    const numberOfBytes = Math.ceil(inclusiveDifference.toString(2).length / 8) + 1; // + 1 to reduce the skew of the modulo.
    let randomNumber = zero;
    for (let counter = 0; counter < numberOfBytes; counter += 4) {
        randomNumber = (randomNumber << thirtytwo) + prng();
    }
    return lower + randomNumber % inclusiveDifference;
}
