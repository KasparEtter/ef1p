/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P, Point } from '../utility/point';

const minDx = 0.002;
const maxDx = 0.2;

export function plot(
    scale: number,
    minX: number,
    maxX: number,
    curve: (x: number) => number,
    derivative1: (x: number) => number,
    derivative2: (x: number) => number,
    reflectAroundXAxes = false,
): Point[] {
    const points = new Array<Point>();

    let x = minX;
    while (x < maxX) {
        points.push(P(scale * x, -scale * curve(x)));
        let dx = maxDx / Math.sqrt(1 + Math.pow(derivative1(x), 2));
        dx = maxDx / Math.sqrt(1 + Math.pow(derivative1(x + dx / 2), 2));
        dx = dx / Math.max(1, Math.min(4, 2 * Math.abs(derivative2(x + dx / 2))));
        dx = Math.max(dx, minDx);
        x += dx;
    }
    points.push(P(scale * maxX, -scale * curve(maxX)));

    if (reflectAroundXAxes) {
        points.unshift(...points.map(point => point.invertY()).reverse());
    }

    return points;
}
