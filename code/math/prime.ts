/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { areCoprime, five, getRandomInteger, halve, isEven, modulo, one, three, two, zero } from './utility';

/**
 * The first 50 prime numbers.
 */
export const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,
    109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229].map(BigInt);

// https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test#Testing_against_small_sets_of_bases
const bases1 = primes.slice(0, 3);
const limit1 = BigInt(25326001);
const bases2 = primes.slice(0, 12);
const limit2 = BigInt('318665857834031151167461');

// Product of the first 40 primes (https://en.wikipedia.org/wiki/Primorial#Table_of_primorials):
const productOfSmallPrimes = BigInt('166589903787325219380851695350896256250980509594874862046961683989710') / two / three/ five; // (We check 2, 3, and 5 with trial division.)
// = 2 * 3 * 5 * 7 * 11 * 13 * 17 * 19 * 23 * 29 * 31 * 37 * 41 * 43 * 47 * 53 * 59 * 61 * 67 * 71 * 73 * 79 * 83 * 89 * 97 * 101 * 103 * 107 * 109 * 113 * 127 * 131 * 137 * 139 * 149 * 151 * 157 * 163 * 167 * 173
const largestOfSmallPrimes = BigInt(173);

// We're not using the multiplicative ring here in order to avoid circular dependencies.
function modularExponentiation(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (exponent === one) {
        return base;
    } else if (isEven(exponent)) {
        return modularExponentiation((base * base) % modulus, halve(exponent), modulus);
    } else {
        return (base * modularExponentiation(base, exponent - one, modulus)) % modulus;
    }
}

/**
 * Determines whether the given integer is a probable prime with the Miller-Rabin primality test.
 * For integers smaller than `limit2`, the result is guaranteed to be correct.
 * For integers larger than `limit2`, 64 rounds are performed by default,
 * leading to an error probability of at most (1/2)^128.
 */
export function isProbablePrime(n: bigint, rounds = 64, skipInitialChecks = false): boolean {
    if (!skipInitialChecks) {
        if (n === two || n === three || n === five) {
            return true;
        }
        // Trial division
        if (n < two || isEven(n) || n % three === zero || n % five === zero) {
            return false;
        }
        // Euclidean algorithm
        if (n > largestOfSmallPrimes && !areCoprime(productOfSmallPrimes, n)) {
            return false;
        }
    }
    const nMinus1 = n - one;
    let d = nMinus1;
    let r = 0;
    while (isEven(d)) {
        d = halve(d);
        r++;
    }
    // Check whether the integer a is a witness for the compositeness of n.
    function isWitness(a: bigint): boolean {
        let x = modularExponentiation(a, d, n);
        if (x === one || x === nMinus1) {
            return false;
        }
        for (let i = r - 1; i !== 0; i--) {
            x = (x * x) % n;
            // https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test#Variants_for_finding_factors
            if (x === one) {
                return true;
            }
            if (x === nMinus1) {
                return false;
            }
        }
        return true;
    }
    if (n < limit1) {
        return !bases1.some(isWitness);
    }
    if (bases2.some(isWitness)) {
        return false;
    }
    if (n < limit2) {
        return true;
    }
    const nMinus2 = n - two;
    for (let k = 0; k < rounds - bases2.length; k++) {
        if (isWitness(getRandomInteger(two, nMinus2))) {
            return false;
        }
    }
    return true;
}

/**
 * The given number does not have to be prime.
 */
export function getNextPrime(n: bigint): bigint {
    if (n < two) {
        return two;
    }
    if (isEven(n)) {
        n += one;
    } else {
        n += two;
    }
    while (!isProbablePrime(n)) {
        n += two;
    }
    return n;
}

/**
 * The given number does not have to be prime.
 */
export function getPreviousPrime(n: bigint): bigint {
    if (n <= three) {
        return two;
    }
    if (isEven(n)) {
        n -= one;
    } else {
        n -= two;
    }
    while (!isProbablePrime(n)) {
        n -= two;
    }
    return n;
}
