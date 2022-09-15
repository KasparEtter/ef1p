/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { printSVG } from '../../../code/svg/elements/svg';
import { bold, superscript, T, Text } from '../../../code/svg/elements/text';

import { addLabel, gap, k, n, textOffset } from './dlp';
import { giantStepRightElements, s } from './dlp-giant-step-right';

addLabel(1, 'G', 'pink');
const t = 7;
for (let i = 2; i < t; i++) {
    addLabel(i, T('G', superscript(i.toString())));
}
addLabel(t, '…');
addLabel(k, 'K', 'green');
addLabel(k + 1, 'KG', 'green');
addLabel(k + 2, T('KG', superscript('2')), 'green');
addLabel(k + 3, '…', 'green');
addLabel(n, 'I');

giantStepRightElements.push(new Text({ position: P((1 + s / 2) * gap, -textOffset), text: bold(T('· G', superscript('s'))), verticalAlignment: 'bottom', color: 'blue' }));

printSVG(...giantStepRightElements);
