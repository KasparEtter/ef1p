/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';

import { a, addAxesAndCurve, addLine, addPoint, addReflection, curve, elements } from './elliptic-curve';

const Ax = -0.7;
const Ay = curve(Ax);

const s = (3 * Ax * Ax + a) / (2 * Ay);
const Dx = s ** 2 - 2 * Ax;
const Dy = -Ay + -s * (Dx - Ax);

addAxesAndCurve();
addLine(Ax, Ay, s);
addReflection(Dx, Dy);
addPoint(Ax, Ay, 'A + A', 1.45);
addPoint(Dx, -Dy, '−D', 1.25, 'pink');
addPoint(Dx, Dy, '= D', 0.75, 'pink', 37);

printSVG(...elements);
