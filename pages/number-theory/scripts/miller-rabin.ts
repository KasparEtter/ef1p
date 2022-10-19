/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { encodePercent } from '../../../code/utility/string';

import { encodeIntegerWithoutStore } from '../../../code/math/integer';

// This script generates the Markdown table at /number-theory/#small-prime-numbers-as-candidates.
// You can run it with `npx ts-node pages/number-theory/scripts/miller-rabin.ts` from the project directory.

console.log('| l | Candidates | Smallest composite integer for which the test fails');
console.log('|-:|:-|-:');

// https://oeis.org/A014233
const failures = '2047, 1373653, 25326001, 3215031751, 2152302898747, 3474749660383, 341550071728321, 341550071728321, 3825123056546413051, 3825123056546413051, 3825123056546413051, 318665857834031151167461, 3317044064679887385961981'.split(', ').map(BigInt);
const primes = '2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41'.split(', ').map(BigInt);
for (let i = 1; i <= failures.length; i++) {
    const candidates = primes.slice(0, i).join(', ');
    const failure = encodeIntegerWithoutStore(failures[i - 1]);
    console.log(`| ${i} | [${candidates}](#tool-integer-miller-rabin-primality-test&candidates=${encodePercent(candidates)}) | [${failure}](#tool-integer-miller-rabin-primality-test&input=${encodePercent(failure)}&candidates=${encodePercent(candidates)}&rounds=0) > 2<sup>${failures[i - 1].toString(2).length - 1}</sup>`);
}
