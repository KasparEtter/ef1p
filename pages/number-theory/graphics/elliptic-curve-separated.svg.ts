/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeWidthMargin } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { Polyline } from '../../../code/svg/elements/polyline';
import { printSVG } from '../../../code/svg/elements/svg';

import { addAxes } from '../../../code/svg/graphics/axes';
import { plot } from '../../../code/svg/graphics/plot';

export const scale = 60;

export function curve(x: number): number {
    return Math.sqrt(x * x * x - x);
}

function derivative1(x: number): number {
    return (3 * x * x - 1) / (2 * curve(x));
}

function derivative2(x: number): number {
    return (3 * x * x * x * x - 6 * x * x - 1) / (4 * Math.pow(curve(x), 3));
}

const points1 = plot(scale, -1, 0, curve, derivative1, derivative2, true);
const points2 = plot(scale, 1, 2.5, curve, derivative1, derivative2, true);

const bottomRight = points2[0].add(strokeWidthMargin);
const topLeft = bottomRight.invert();

export const elements = new Array<VisualElement>();

addAxes(elements, scale, topLeft, bottomRight);
elements.push(new Polyline({ points: points1, color: 'blue', classes: 'thick', ignoreForClipping: true }));
elements.push(new Polyline({ points: points2, color: 'blue', classes: 'thick', ignoreForClipping: true }));

for (const x of [-1, 0, 1]) {
    elements.push(new Circle({
        center: P(scale * x, 0),
        radius: 7.5,
        color: 'green',
        classes: 'filled',
        ignoreForClipping: true,
    }));
}

printSVG(...elements);
