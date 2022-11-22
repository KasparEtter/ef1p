/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';
import { bold, superscript, T } from '../../../code/svg/elements/text';

import { addLabel, k, n } from './dlp';
import { exhaustiveSearchElements, firstArc } from './dlp-exhaustive-search';

addLabel(1, 'G', 'pink');
const s = 7;
for (let i = 2; i < s; i++) {
    addLabel(i, T('G', superscript(i.toString())));
}
addLabel(s, '…');
addLabel(k, T('G', superscript('k'), ' = K'), 'green');
addLabel(n, 'I');

exhaustiveSearchElements.push(firstArc.text(bold('· G')));

printSVG(...exhaustiveSearchElements);
