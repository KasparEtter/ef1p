/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { Circle } from '../../../code/svg/elements/circle';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { circles, elementRadius, pollardsRhoElements, rhoRadius, tailCircles } from './pollards-rho';

const color: Color = 'gray';

function addCircle(nextCircle: Circle, angle: number, visible = true): Circle {
    const circle = new Circle({ center: nextCircle.props.center.point(rhoRadius, angle * Math.PI / 3 + Math.PI / 2), radius: elementRadius, color });
    if (visible) {
        pollardsRhoElements.push(circle, Line.connectEllipses(circle, nextCircle, { color }));
    }
    return circle;
}

addCircle(tailCircles[0], 1);
addCircle(tailCircles[0], 5);
const tree1 = addCircle(tailCircles[1], 1);
addCircle(tree1, 1);
addCircle(addCircle(tree1, 2), 1);
addCircle(addCircle(circles[1], 2), 1);
addCircle(circles[4], 5);
const newComponent = addCircle(addCircle(addCircle(circles[4], 4), 4, false), 5, false);

addCircle(newComponent, 2);
const tree2 = addCircle(addCircle(newComponent, 4), 0);
addCircle(tree2, 2);
addCircle(addCircle(tree2, 1), 0);
const tree3 = addCircle(tree2, 5);
addCircle(tree3, 1);
addCircle(tree3, 5);

printSVG(...pollardsRhoElements);
