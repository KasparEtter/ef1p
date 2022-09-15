/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';

import { addLabel, k, n } from './dlp';
import { exhaustiveSearchElements } from './dlp-exhaustive-search';

addLabel(1, 'G', 'pink');
const s = 7;
for (let i = 2; i < s; i++) {
    addLabel(i, i + 'G');
}
addLabel(s, '…');
addLabel(k, 'kG = K', 'green');
addLabel(n, 'O');

printSVG(...exhaustiveSearchElements);
