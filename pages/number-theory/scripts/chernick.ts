/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { encodePercent } from '../../../code/utility/string';

import { factorize, phi } from '../../../code/math/factorization';
import { encodeIntegerWithoutStore } from '../../../code/math/integer';
import { one, six } from '../../../code/math/utility';

// This script generates the Markdown table at /number-theory/#chernicks-carmichael-numbers.
// You can run it with `npx ts-node pages/number-theory/scripts/chernick.ts` from the project directory.

console.log('| k | Carmichael number | Prime factorization | Failure rate per round | Failure rate after 100 rounds');
console.log('|-:|-:|-:|-:|-:');

const digits = 4;

// https://oeis.org/A033502
const chernicksCarmichaelNumbers = '1729, 294409, 56052361, 118901521, 172947529, 216821881, 228842209, 1299963601, 2301745249, 9624742921, 11346205609, 13079177569, 21515221081, 27278026129, 65700513721, 71171308081, 100264053529, 168003672409, 172018713961, 173032371289, 464052305161'.split(', ').map(BigInt);
for (const n of chernicksCarmichaelNumbers) {
    const factors = factorize(n)!;
    const k = (factors[0].base - one) / six;
    const encoding = encodeIntegerWithoutStore(n);
    const escaped = encodePercent(encoding);
    const rate = Number(phi(factors)) / (Number(n) - 1);
    console.log(`| ${encodeIntegerWithoutStore(k)} | [${encoding}](#tool-integer-fermat-primality-test&input=${escaped}&bases=&rounds=100) | [${factors.map(factor => encodeIntegerWithoutStore(factor.base)).join(' · ')}](#tool-integer-factorization-trial-division&input=${escaped}) | ${rate.toFixed(digits)} | ${(rate ** 100).toFixed(digits)}`);
}
