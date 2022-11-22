/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';
import { bold } from '../../../code/svg/elements/text';

import { addLabel, k, n } from './dlp';
import { firstGreenArc, giantStepLeftElements, lastBlueArc } from './dlp-giant-step-left';

addLabel(1, 'G', 'green');
addLabel(2, '2G', 'green');
addLabel(3, '…', 'green');
addLabel(4, 'sG', 'green');
addLabel(5, '…');
addLabel(k, 'kG = K', 'pink');
addLabel(n, 'O');

giantStepLeftElements.push(firstGreenArc.text(bold('+ G')));
giantStepLeftElements.push(lastBlueArc.text(bold('− sG')));

printSVG(...giantStepLeftElements);
