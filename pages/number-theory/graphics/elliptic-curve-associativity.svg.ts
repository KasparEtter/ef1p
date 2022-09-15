/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';

import { addAxesAndCurve, addLine, addPoint, addReflection, curve, elements } from './elliptic-curve';

const Ax = -1.28;
const Ay = -curve(Ax);

const Bx = 1.3;
const By = curve(Bx);

const Cx = -1.05;
const Cy = curve(Cx);

const ABs = (By - Ay) / (Bx - Ax);
const ABx = ABs ** 2 - Ax - Bx;
const ABy = -Ay + -ABs * (ABx - Ax);

const ABCs = (Cy - ABy) / (Cx - ABx);
const ABCx = ABCs ** 2 - ABx - Cx;
const ABCy = -ABy + -ABCs * (ABCx - ABx);

const BCs = (Cy - By) / (Cx - Bx);
const BCx = BCs ** 2 - Bx - Cx;
const BCy = -By + -BCs * (BCx - Bx);

addAxesAndCurve();

addLine(Ax, Ay, ABs, 'red');
addReflection(ABx, ABy, 'red');
addLine(ABx, ABy, ABCs, 'orange');
addReflection(ABCx, ABCy, 'orange');
addLine(Bx, By, BCs, 'brown');
addReflection(BCx, BCy, 'brown');
addLine(Ax, Ay, (BCy - Ay) / (BCx - Ax), 'yellow');

addPoint(Ax, Ay, 'A', 0.98, 'pink');
addPoint(Bx, By, 'B', 1.3, 'pink');
addPoint(Cx, Cy, 'C', 1.54, 'pink');
addPoint(ABx, -ABy, undefined, 0, 'red');
addPoint(ABx, ABy, 'A + B', 1.86, 'red', 48);
addPoint(ABCx, -ABCy, undefined, 0, 'orange');
addPoint(ABCx, ABCy, 'A + B + C', 1.14, 'orange', 58);
addPoint(BCx, -BCy, undefined, 0, 'brown');
addPoint(BCx, BCy, 'B + C', 0.7, 'brown', 40);

printSVG(...elements);
