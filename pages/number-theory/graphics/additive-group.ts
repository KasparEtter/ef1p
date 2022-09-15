/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { circleRadius, strokeWidth, textHeight, textToLineDistance } from '../../../code/svg/utility/constants';
import { zeroPoint } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { InvisiblePoint } from '../../../code/svg/elements/invisible';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, Text } from '../../../code/svg/elements/text';

const clockRadius = 80;
const pointRadius = circleRadius * strokeWidth;

export function printAdditiveGroup(modulus: number, generator: number, cosets: number): void {
    const elements = new Array<VisualElement>();

    elements.push(new Circle({ center: zeroPoint, radius: clockRadius }));
    elements.push(new Text({ position: zeroPoint, text: bold('+' + generator.toString()) }));

    const textPoints = zeroPoint.radial(clockRadius + pointRadius + textToLineDistance + textHeight / 2, modulus);
    elements.push(...textPoints.map((point, index) => new Text({ position: point, text: bold(index.toString()) })));

    const linePoints = zeroPoint.radial(clockRadius, modulus);
    const colors: Color[] = ['red', 'orange', 'yellow'];

    for (let coset = cosets; coset >= 0; coset--) {
        let element = coset;
        do {
            elements.push(new Line({
                start: linePoints[element % modulus],
                end: linePoints[(element + generator) % modulus],
                color: colors[coset],
                marker: ['middle', 'end'],
            }).shorten(0, pointRadius));
            element = (element + generator) % modulus;
        } while (element !== coset);
    }

    const invisiblePoints = zeroPoint.radial(clockRadius + pointRadius + textToLineDistance + textHeight, 4);
    elements.push(...invisiblePoints.map(point => new InvisiblePoint({ point })));

    printSVG(...elements);
}
