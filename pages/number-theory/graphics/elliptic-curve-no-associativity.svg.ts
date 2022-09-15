/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printSVG } from '../../../code/svg/elements/svg';

import { addAxesAndCurve, addLine, addPoint, curve, elements } from './elliptic-curve';

const Ax = -1.3;
const Ay = curve(Ax);

const Bx = 1.45;
const By = curve(Bx);

const Cx = -1.1;
const Cy = curve(Cx);

const ABs = (By - Ay) / (Bx - Ax);
const ABx = ABs ** 2 - Ax - Bx;
const ABy = Ay + ABs * (ABx - Ax);

const ABpCs = (Cy - ABy) / (Cx - ABx);
const ABpCx = ABpCs ** 2 - ABx - Cx;
const ABpCy = ABy + ABpCs * (ABpCx - ABx);

const BCs = (Cy - By) / (Cx - Bx);
const BCx = BCs ** 2 - Bx - Cx;
const BCy = By + BCs * (BCx - Bx);

const ApBCs = (BCy - Ay) / (BCx - Ax);
const ApBCx = ApBCs ** 2 - Ax - BCx;
const ApBCy = Ay + ApBCs * (ApBCx - Ax);

addAxesAndCurve();

addLine(Ax, Ay, ABs, 'red');
addLine(ABx, ABy, ABpCs, 'orange');
addLine(Bx, By, BCs, 'brown');
addLine(Ax, Ay, ApBCs, 'yellow');

addPoint(Ax, Ay, 'X', 0.14, 'pink', 26);
addPoint(Bx, By, 'Y', 1.25, 'pink', 18);
addPoint(Cx, Cy, 'Z', 1.24, 'pink', 28);
addPoint(ABx, ABy, 'X + Y', 0.6, 'red', 37);
addPoint(ABpCx, ABpCy, '(X + Y) + Z', 0.28, 'orange', 45);
addPoint(BCx, BCy, 'Y + Z', 1.25, 'brown', 35);
addPoint(ApBCx, ApBCy, 'X + (Y + Z)', 1.1, 'yellow', 65);

printSVG(...elements);
