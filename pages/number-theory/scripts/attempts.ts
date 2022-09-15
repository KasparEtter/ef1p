/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { encodeIntegerWithoutStore } from '../../../code/math/integer';

// This script generates the Markdown table at /number-theory/#expected-number-of-attempts.
// You can run it with `npx ts-node pages/number-theory/scripts/attempts.ts` from the project directory.

console.log('| Number of bits | Expected number of attempts | Squared for safe prime');
console.log('|-:|-:|-:');

const multiplier = Math.log(2) / 2;

for (let i = 3; i <= 11; i++) {
    const bits = 2 ** i;
    const attempts = bits * multiplier;
    console.log(`| ${encodeIntegerWithoutStore(bits)} | ${encodeIntegerWithoutStore(Math.round(attempts))} | ${encodeIntegerWithoutStore(Math.round(attempts * attempts))}`);
}
