/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { printSVG } from '../../../code/svg/elements/svg';
import { bold, Text } from '../../../code/svg/elements/text';

import { addLabel, gap, k, n, textOffset } from './dlp';
import { giantStepRightElements, s } from './dlp-giant-step-right';

addLabel(1, 'G', 'pink');
const t = 7;
for (let i = 2; i < t; i++) {
    addLabel(i, i + 'G');
}
addLabel(t, '…');
addLabel(k, 'K', 'green');
addLabel(k + 1, 'K+G', 'green');
addLabel(k + 2, '…', 'green');
addLabel(n, 'O');

giantStepRightElements.push(new Text({ position: P((1 + s / 2) * gap, -textOffset), text: bold('+ sG'), verticalAlignment: 'bottom', color: 'blue' }));

printSVG(...giantStepRightElements);
