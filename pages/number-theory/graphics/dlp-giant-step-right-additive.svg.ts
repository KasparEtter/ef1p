/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';
import { bold } from '../../../code/svg/elements/text';

import { addLabel, k, n } from './dlp';
import { firstBlueArc, giantStepRightElements, lastGreenArc, s } from './dlp-giant-step-right';

addLabel(1, 'G', 'pink');
const t = s;
for (let i = 2; i < t; i++) {
    addLabel(i, i + 'G');
}
addLabel(t, '…');
addLabel(s + 1, '(s+1)G');
addLabel(s + 2, '…');
addLabel(k, 'kG=K', 'green');
addLabel(k + 1, 'K+G', 'green');
addLabel(k + 2, '…', 'green');
addLabel(k + 3, 'K+(s−1)G', 'green');
addLabel(n, 'O');

giantStepRightElements.push(lastGreenArc.text(bold('+ G')));
giantStepRightElements.push(firstBlueArc.text(bold('+ sG')));

printSVG(...giantStepRightElements);
