/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';

import { addAxesAndCurve, addPoint, addVertical, elements, startX } from './elliptic-curve';

addAxesAndCurve();
addVertical(startX);
addPoint(startX, 0, 'B', 1.25);
addPoint(startX, 0, '−B', 0.755, 'green', 40, false);
addPoint(startX, 3, 'O', 1.25, 'green', 30, false);

printSVG(...elements);
