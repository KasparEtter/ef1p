/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { sortIntegers } from '../utility/array';

import { isProbablePrime, primes } from './prime';
import { abs, greatestCommonDivisor, leastCommonMultiple, one, two, zero } from './utility';

export interface Factor {
    base: bigint;
    exponent: bigint;
}

export function f(x: bigint, n: bigint, addend: bigint): bigint {
    return (x * x + addend) % n;
}

interface Rounds {
    value: number;
}

// At this point, n is certainly a composite number.
function pollardsRho(n: bigint, rounds: Rounds, addend = one): bigint[] | null {
    let a = two;
    let b = two;
    let c = one;
    while (c === one && rounds.value > zero) {
        a = f(a, n, addend);
        b = f(f(b, n, addend), n, addend);
        c = greatestCommonDivisor(n, abs(a - b));
        rounds.value--;
    }
    if (c === one) {
        // Ran out of rounds.
        return null;
    } else if (c === n) {
        if (addend + one < n) {
            return pollardsRho(n, rounds, addend + one);
        } else {
            return null;
        }
    } else {
        const factors1 = pollardsRhoOrPrime(c, rounds);
        if (factors1 === null) {
            return null;
        }
        const factors2 = pollardsRhoOrPrime(n / c, rounds);
        if (factors2 === null) {
            return null;
        }
        return [...factors1, ...factors2];
    }
}

// At this point, all prime factors of n are larger than 229.
function pollardsRhoOrPrime(n: bigint, rounds: Rounds): bigint[] | null {
    if (isProbablePrime(n, 64, true)) {
        return [n];
    } else {
        return pollardsRho(n, rounds);
    }
}

export function sortAndCombineFactors(integers: bigint[]): Factor[] {
    if (integers.length === 0) {
        return [];
    }
    const factors: Factor[] = [];
    const sorted = sortIntegers(integers);
    let base = sorted[0];
    let exponent = zero;
    for (const factor of sorted) {
        if (factor !== base) {
            factors.push({ base, exponent });
            base = factor;
            exponent = one;
        } else {
            exponent++;
        }
    }
    factors.push({ base, exponent });
    return factors;
}

const cache: { [key: string]: Factor[] | null | undefined } = {};

/**
 * Computes the prime factorization of the given positive integer.
 * After trial division, it performs up to 100'000 rounds of Pollard's rho factorization algorithm.
 * If the given integer cannot be factorized in 100'000 rounds, the function returns null.
 */
export function factorize(integer: bigint): Factor[] | null {
    if (integer < one) {
        throw new Error(`factorization.ts: The integer has to be positive but was ${integer}.`);
    } else if (integer === one) {
        return [{ base: integer, exponent: integer }]
    }
    const cachedFactors = cache[integer.toString()];
    if (cachedFactors !== undefined) {
        return cachedFactors;
    }
    const factors: Factor[] = [];
    for (let i = 0; i < primes.length && integer !== one; i++) {
        const base = primes[i];
        let exponent = zero;
        while (integer % base === zero) {
            integer /= base;
            exponent++;
        }
        if (exponent > zero) {
            factors.push({ base, exponent });
        }
    }
    if (integer !== one) {
        const result = pollardsRhoOrPrime(integer, { value: 100_000 });
        if (result === null) {
            cache[integer.toString()] = null;
            return null;
        }
        factors.push(...sortAndCombineFactors(result));
    }
    cache[integer.toString()] = factors;
    return factors;
}

/**
 * Computes Euler's totient function from the given factors.
 */
export function phi(factors: Factor[]): bigint {
    let result = one;
    for (const factor of factors) {
        result *= (factor.base - one) * (factor.base ** (factor.exponent - one));
    }
    return result;
}

/**
 * Computes Carmichaels's totient function from the given factors.
 */
export function lambda(factors: Factor[]): bigint {
    const integers = factors.map(factor => (factor.base ** (factor.exponent - (factor.base === two && factor.exponent > two ? two : one))) * (factor.base - one));
    return integers.reduce((previous, current) => leastCommonMultiple(previous, current), one);
}
