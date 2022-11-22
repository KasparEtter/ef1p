/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';
import { bold, superscript, T } from '../../../code/svg/elements/text';

import { addLabel, k, n } from './dlp';
import { firstGreenArc, giantStepLeftElements, lastBlueArc } from './dlp-giant-step-left';

addLabel(1, 'G', 'green');
addLabel(2, T('G', superscript('2')), 'green');
addLabel(3, '…', 'green');
addLabel(4, T('G', superscript('s')), 'green');
addLabel(5, '…');
addLabel(k, T('G', superscript('k'), ' = K'), 'pink');
addLabel(n, 'I');

giantStepLeftElements.push(firstGreenArc.text(bold('· G')));
giantStepLeftElements.push(lastBlueArc.text(bold(T('/ G', superscript('s')))));

printSVG(...giantStepLeftElements);
