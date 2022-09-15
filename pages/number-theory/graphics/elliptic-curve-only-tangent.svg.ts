/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';

import { a, addAxesAndCurve, addLine, addPoint, curve, elements } from './elliptic-curve';

const Dx = -0.7;
const Dy = curve(Dx);

const s = (3 * Dx * Dx + a) / (2 * Dy);
const Ex = s ** 2 - 2 * Dx;
const Ey = Dy + s * (Ex - Dx);

addAxesAndCurve();
addLine(Dx, Dy, s);
addPoint(Dx, Dy, 'D', 1.45);
addPoint(Ex, Ey, 'E', 1.25);

printSVG(...elements);
