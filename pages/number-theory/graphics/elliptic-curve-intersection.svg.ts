/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeWidthMargin } from '../../../code/svg/utility/constants';

import { VisualElement } from '../../../code/svg/elements/element';
import { Polyline } from '../../../code/svg/elements/polyline';
import { printSVG } from '../../../code/svg/elements/svg';

import { addAxes } from '../../../code/svg/graphics/axes';
import { plot } from '../../../code/svg/graphics/plot';

import { scale } from './elliptic-curve';

function curve(x: number): number {
    return Math.sqrt(x * x * x - 3 * x + 2);
}

function derivative1(x: number): number {
    return (3 * (x * x - 1)) / (2 * curve(x));
}

function derivative2(x: number): number {
    return (3 * (x - 1) * (x + 3)) / (4 * (x + 2) * curve(x));
}

const startX = -2;
const endX = 2.5;

const points = plot(scale, startX, endX, curve, derivative1, derivative2, true);

const bottomRight = points[0].add(strokeWidthMargin);
const topLeft = bottomRight.invert();

const elements = new Array<VisualElement>();
addAxes(elements, scale, topLeft, bottomRight);
elements.push(new Polyline({ points, color: 'blue', classes: 'thick', ignoreForClipping: true }));
printSVG(...elements);
