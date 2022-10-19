/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { encodePercent } from '../../../code/utility/string';

import { factorize, phi } from '../../../code/math/factorization';
import { encodeIntegerWithoutStore } from '../../../code/math/integer';
import { one, two } from '../../../code/math/utility';

// This script generates the Markdown tables at /number-theory/#integers-for-which-half-of-all-coprime-elements-are-fermat-liars.
// You can run it with `npx ts-node pages/number-theory/scripts/half-liars.ts` from the project directory.

const digits = 4;

function generateTable(integers: bigint[]) {
    console.log('| n | Prime factorization | Number of liars | Ratio of liars<br>to all candidates');
    console.log('|-:|-:|-:|-:');
    for (const n of integers) {
        const factors = factorize(n)!;
        const encoding = encodeIntegerWithoutStore(n);
        const escaped = encodePercent(encoding);
        const numberOfLiars = phi(factors) / two;
        const ratio = Number(numberOfLiars) / (Number(n) - 1);
        console.log(`| [${encoding}](#tool-integer-fermat-primality-test&input=${escaped}&candidates=&rounds=100&abort=false) | [${factors.map(factor => encodeIntegerWithoutStore(factor.base) + (factor.exponent > one ? `<sup>${factor.exponent}</sup>` : '')).join(' · ')}](#tool-integer-factorization-trial-division&integer=${escaped}) | ${encodeIntegerWithoutStore(numberOfLiars)} | ${ratio.toFixed(digits)}`);
    }
}

// https://oeis.org/A191311
generateTable('4, 6, 15, 91, 703, 1891, 2701, 11305, 12403, 13981, 18721, 23001, 30889, 38503, 39865, 49141, 68101, 79003, 88561, 88831, 91001, 93961, 104653, 107185, 137149, 146611, 152551, 157641, 176149, 188191, 204001, 218791, 226801, 228241'.split(', ').map(BigInt));

console.log('-'.repeat(80));

// https://oeis.org/A129521
generateTable('6, 15, 91, 703, 1891, 2701, 12403, 18721, 38503, 49141, 79003, 88831, 104653, 146611, 188191, 218791, 226801, 269011, 286903, 385003, 497503, 597871, 665281, 721801, 736291, 765703, 873181, 954271, 1056331, 1314631, 1373653, 1537381'.split(', ').map(BigInt));
