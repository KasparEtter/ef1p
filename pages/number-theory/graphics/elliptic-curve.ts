/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { strokeWidthMargin } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Polyline } from '../../../code/svg/elements/polyline';
import { bold, large, Text } from '../../../code/svg/elements/text';

import { addAxes } from '../../../code/svg/graphics/axes';
import { plot } from '../../../code/svg/graphics/plot';

export const scale = 60;

export const a = -1;
export const b = 1;

export function curve(x: number): number {
    return Math.sqrt(x * x * x - x + 1);
}

function derivative1(x: number): number {
    return (3 * x * x - 1) / (2 * curve(x));
}

function derivative2(x: number): number {
    return (3 * x * x * x * x - 6 * x * x + 12 * x - 1) / (4 * Math.pow(curve(x), 3));
}

export const startX = -1.32471795724474;
const endX = 2.5;

const points = plot(scale, startX, endX, curve, derivative1, derivative2, true);

const bottomRight = points[0].add(strokeWidthMargin);
const topLeft = bottomRight.invert();

export const elements = new Array<VisualElement>();

export function addAxesAndCurve(grid = false) {
    addAxes(elements, scale, topLeft, bottomRight, grid);
    elements.push(new Polyline({ points, color: 'blue', classes: 'thick', ignoreForClipping: true }));
}

const rangeX = points[0].x / scale;
const rangeY = points[0].y / scale;

export function addLine(x: number, y: number, s: number, color: Color = 'green') {
    // Line: y = s * x + t
    const t = y - s * x;
    elements.push(new Line({
        start: P(scale * (-rangeX), -scale * (s * (-rangeX) + t)),
        end: P(scale * rangeX, -scale * (s * rangeX + t)),
        color,
        classes: 'thick',
        ignoreForClipping: true,
    }));
}

export function addVertical(x: number) {
    elements.push(new Line({
        start: P(scale * x, -scale * rangeY),
        end: P(scale * x, scale * rangeY),
        color: 'green',
        classes: 'thick',
        ignoreForClipping: true,
    }));
}

export function addReflection(x: number, y: number, color: Color = 'pink') {
    elements.push(new Line({
        start: P(scale * x, -scale * y),
        end: P(scale * x, scale * y),
        color,
        classes: 'thick',
        ignoreForClipping: true,
    }));
}

export function addPoint(x: number, y: number, text?: string, angle: number = 0, color: Color = 'green', distance = 30, circle = true) {
    const point = P(scale * x, -scale *y);
    if (circle) {
        elements.push(new Circle({
            center: point,
            radius: 7.5,
            color,
            classes: 'filled',
            ignoreForClipping: true,
        }));
    }
    if (text !== undefined) {
        elements.push(new Text({
            position: point.point(distance, Math.PI * angle),
            text: large(bold(text)),
            color,
            ignoreForClipping: true,
        }));
    }
}
