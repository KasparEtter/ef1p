/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';
import { bold, superscript, T } from '../../../code/svg/elements/text';

import { addLabel, k, n } from './dlp';
import { firstBlueArc, giantStepRightElements, lastGreenArc, s } from './dlp-giant-step-right';

addLabel(1, 'G', 'pink');
const t = s;
for (let i = 2; i < t; i++) {
    addLabel(i, T('G', superscript(i.toString())));
}
addLabel(t, '…');
addLabel(s + 1, T('G', superscript('s + 1')));
addLabel(s + 2, '…');
addLabel(k, T('G', superscript('k'), ' = K'), 'green');
addLabel(k + 1, 'KG', 'green');
addLabel(k + 2, '…', 'green');
addLabel(k + 3, T('KG', superscript('s − 1')), 'green');
addLabel(n, 'I');

giantStepRightElements.push(lastGreenArc.text(bold('· G')));
giantStepRightElements.push(firstBlueArc.text(bold(T('· G', superscript('s')))));

printSVG(...giantStepRightElements);
