/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { getLastElement } from '../../../code/utility/array';

import { strokeWidthMargin } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { Polyline } from '../../../code/svg/elements/polyline';
import { printSVG } from '../../../code/svg/elements/svg';

import { addAxes } from '../../../code/svg/graphics/axes';
import { plot } from '../../../code/svg/graphics/plot';

const scale = 40;

export function plotCubicFunction(
    curve: (x: number) => number,
    derivative1: (x: number) => number,
    derivative2: (x: number) => number,
    roots: number[],
    minX = -1.75, // included
    maxX = 1.75, // excluded
) {
    const points = plot(scale, minX, maxX, curve, derivative1, derivative2);

    const topLeft = P(points[0].x, getLastElement(points).y).subtract(strokeWidthMargin);
    const bottomRight = P(getLastElement(points).x, points[0].y).add(strokeWidthMargin);

    const elements = new Array<VisualElement>();
    addAxes(elements, scale, topLeft, bottomRight);
    elements.push(new Polyline({ points, color: 'blue', classes: 'thick', ignoreForClipping: true }));

    for (const root of roots) {
        const point = P(scale * root, 0);
        elements.push(new Circle({
            center: point,
            radius: 6,
            color: 'green',
            classes: 'filled',
            ignoreForClipping: true,
        }));
    }

    printSVG(...elements);
}
