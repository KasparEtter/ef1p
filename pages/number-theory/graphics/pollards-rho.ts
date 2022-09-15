/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { zeroPoint } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { bold, subscript, T, TextLine } from '../../../code/svg/elements/text';

export const elementRadius = 16;
export const rhoRadius = 56;

export const cycleLength = 6;
export const tailLength = 2;

function getLabel(index: number): TextLine {
    return bold(T('S', subscript(index.toString())));
}

export const pollardsRhoElements = new Array<VisualElement>();

const centers = zeroPoint.radial(rhoRadius, cycleLength, Math.PI / 6 * 5);
export const circles = centers.map(center => new Circle({ center, radius: elementRadius }));
const lines = circles.map((circle, index) => Line.connectEllipses(circle, circles[(index + 1) % cycleLength]));
const texts = circles.map((circle, index) => circle.text(getLabel(tailLength + index + 1)));
pollardsRhoElements.push(...lines, ...circles, ...texts);

let nextCenter = centers[0];
let nextCircle = circles[0];
export const tailCircles: Circle[] = [];
for (let i = tailLength; i > 0; i--) {
    nextCenter = nextCenter.addY(rhoRadius);
    const circle = new Circle({ center: nextCenter, radius: elementRadius });
    pollardsRhoElements.push(Line.connectEllipses(circle, nextCircle));
    pollardsRhoElements.push(...circle.withText(getLabel(i)));
    tailCircles.unshift(circle);
    nextCircle = circle;
}
