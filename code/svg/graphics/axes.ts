/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../utility/color';

import { strokeRadius, strokeRadiusMargin, textToLineDistance } from '../utility/constants';
import { P, Point } from '../utility/point';

import { VisualElement } from '../elements/element';
import { InvisiblePoint } from '../elements/invisible';
import { Line } from '../elements/line';
import { bold, Text } from '../elements/text';

const marker = 'end';
const classes = 'thin';
const ignoreForClipping = true;

function encodeNumber(value: number): string {
    return value.toString().replace(/-/, '−');
}

export function addAxes(elements: VisualElement[], scale: number, topLeft: Point, bottomRight: Point, grid = true, labels = true, color: Color = 'gray') {
    elements.push(new InvisiblePoint({ point: topLeft.add(strokeRadiusMargin) }));
    elements.push(new InvisiblePoint({ point: bottomRight.subtract(strokeRadiusMargin) }));

    elements.push(new Line({ start: P(topLeft.x + strokeRadius, 0), end: P(bottomRight.x, 0), color, marker, ignoreForClipping }));
    elements.push(new Line({ start: P(0, bottomRight.y - strokeRadius), end: P(0, topLeft.y), color, marker, ignoreForClipping }));

    if (labels) {
        elements.push(new Text({ position: P(bottomRight.x - textToLineDistance, textToLineDistance - 2), text: bold('x'), horizontalAlignment: 'right', verticalAlignment: 'top', color, ignoreForClipping }));
        elements.push(new Text({ position: P(-textToLineDistance, topLeft.y + textToLineDistance - 2), text: bold('y'), horizontalAlignment: 'right', verticalAlignment: 'top', color, ignoreForClipping }));
    }

    if (grid) {
        const startY = Math.ceil(topLeft.y / scale);
        const endY = Math.floor(bottomRight.y / scale);
        const x1 = topLeft.x + strokeRadius / 2;
        const x2 = bottomRight.x - strokeRadius / 2;
        const x = topLeft.x - textToLineDistance;
        for (let i = startY; i <= endY; i++) {
            const y = scale * i;
            if (i !== 0) {
                elements.push(new Line({ start: P(x1, y), end: P(x2, y), color, classes, ignoreForClipping }));
            }
            if (labels) {
                elements.push(new Text({ position: P(x, y), text: encodeNumber(-i), horizontalAlignment: 'right', verticalAlignment: 'middle', color }));
            }
        }

        const startX = Math.ceil(topLeft.x / scale);
        const endX = Math.floor(bottomRight.x / scale);
        const y1 = topLeft.y + strokeRadius / 2;
        const y2 = bottomRight.y - strokeRadius / 2;
        const y = bottomRight.y + textToLineDistance;
        for (let i = startX; i <= endX; i++) {
            const x = scale * i;
            if (i !== 0) {
                elements.push(new Line({ start: P(x, y1), end: P(x, y2), color, classes, ignoreForClipping }));
            }
            if (labels) {
                elements.push(new Text({ position: P(x, y), text: encodeNumber(i), horizontalAlignment: 'middle', verticalAlignment: 'top', color }));
            }
        }
    }
}
