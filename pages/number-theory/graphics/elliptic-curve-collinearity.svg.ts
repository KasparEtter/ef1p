/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';

import { addAxesAndCurve, addLine, addPoint, addReflection, curve, elements } from './elliptic-curve';

const x1 = -1.25;
const y1 = -curve(x1);

const x2 = 0.37;
const y2 = curve(x2);

const s = (y1 - y2) / (x1 - x2);
const x3 = s ** 2 - x1 - x2;
const y3 = y1 + s * (x3 - x1);

addAxesAndCurve();
addLine(x1, y1, s);
addReflection(x1, y1);
addReflection(x2, y2);
addReflection(x3, y3);
addPoint(x1, y1, 'A', 1.1);
addPoint(x2, y2, 'B', 1.5);
addPoint(x3, y3, 'C', 1.25);
addPoint(x1, -y1, '−A', 1.05, 'pink', 37);
addPoint(x2, -y2, '−B', 0.5, 'pink', 35);
addPoint(x3, -y3, '−C', 0.78, 'pink', 40);

printSVG(...elements);
