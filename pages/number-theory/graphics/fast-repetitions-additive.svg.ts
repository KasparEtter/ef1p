/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';

import { addArcs, addDashes, addLabel, fastRepetitionsElements, n } from './fast-repetitions';

addLabel(1, 'A');
for (let i = 2; i <= n; i++) {
    addLabel(i, i + 'A');
}

addArcs('· 2', '+ A');
addDashes();

printSVG(...fastRepetitionsElements);
