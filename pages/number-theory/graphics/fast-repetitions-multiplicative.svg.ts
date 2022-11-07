/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { lineHeight } from '../../../code/svg/utility/constants';

import { InvisiblePoint } from '../../../code/svg/elements/invisible';
import { printSVG } from '../../../code/svg/elements/svg';
import { superscript, T } from '../../../code/svg/elements/text';
import { P } from '../../../code/svg/utility/point';

import { addArcs, addDashes, addLabel, fastRepetitionsElements, gap, largeRadius, n, textOffset } from './fast-repetitions';

addLabel(1, 'A');
for (let i = 2; i <= n; i++) {
    addLabel(i, T('A', superscript(i.toString())));
}

addArcs(T('X', superscript('2')), '· A');
addDashes();

fastRepetitionsElements.push(new InvisiblePoint({ point: P(gap, -textOffset - largeRadius - lineHeight + 7) }))

printSVG(...fastRepetitionsElements);
