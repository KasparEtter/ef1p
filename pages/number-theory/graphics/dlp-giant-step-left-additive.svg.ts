/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { printSVG } from '../../../code/svg/elements/svg';
import { bold, Text } from '../../../code/svg/elements/text';

import { addLabel, gap, k, n, textOffset } from './dlp';
import { giantStepLeftElements, s } from './dlp-giant-step-left';

addLabel(1, 'G', 'green');
const t = 7;
for (let i = 2; i < t; i++) {
    addLabel(i, i + 'G', i <= s ? 'green' : undefined);
}
addLabel(t, '…');
addLabel(k, 'K', 'pink');
addLabel(n, 'O');

giantStepLeftElements.push(new Text({ position: P((k - s / 2) * gap, -textOffset), text: bold('− sG'), verticalAlignment: 'bottom', color: 'blue' }));

printSVG(...giantStepLeftElements);
