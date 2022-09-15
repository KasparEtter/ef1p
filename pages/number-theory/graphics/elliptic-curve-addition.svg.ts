/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { addAxesAndCurve, addLine, addPoint, addReflection, curve, elements, scale } from './elliptic-curve';

const Ax = -1.25;
const Ay = -curve(Ax);

const Bx = 0.37;
const By = curve(Bx);

const s = (By - Ay) / (Bx - Ax);
const Cx = s ** 2 - Ax - Bx;
const Cy = -Ay + -s * (Cx - Ax);

addAxesAndCurve();

elements.push(...new Line({
    start: P(scale * Ax, -scale * Ay),
    end: P(scale * Bx, -scale * Ay),
}).withText('dx', 'right'));

elements.push(...new Line({
    start: P(scale * Bx, -scale * Ay),
    end: P(scale * Bx, -scale * By),
}).withText('dy', 'right'));

addLine(Ax, Ay, s);
addReflection(Cx, Cy);
addPoint(Ax, Ay, 'A', 1.1);
addPoint((Ax + Bx) / 2, (Ay + By) / 2, '+', 1.3, 'green', 27, false);
addPoint(Bx, By, 'B', 1.5);
addPoint(Cx, -Cy, '−C', 1.25, 'pink');
addPoint(Cx, Cy, '= C', 0.75, 'pink', 37);

printSVG(...elements);
