/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';

import { addAxesAndCurve, addPoint, addVertical, curve, elements } from './elliptic-curve';

const Ax = 1;
const Ay = curve(Ax);

addAxesAndCurve();
addVertical(Ax);
addPoint(Ax, Ay, 'A', 1.2);
addPoint(Ax, -Ay, '−A', 0.8, 'green', 35);
addPoint(Ax, 3, 'O', 1.2, 'green', 30, false);

printSVG(...elements);
