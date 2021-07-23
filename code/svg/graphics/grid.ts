/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../utility/color';

import { lineHeight, textHeight, textToLineDistance } from '../utility/constants';
import { P } from '../utility/point';
import { rotate } from '../utility/transform';

import { VisualElement } from '../elements/element';
import { InvisiblePoint } from '../elements/invisible';
import { Line } from '../elements/line';
import { bold, estimateTextWidth, Text } from '../elements/text';

export function addGrid(elements: VisualElement[], scale: number, xAxis: string, xLabels: string[], yAxis: string, yLabels: string[], color?: Color, rotated = false) {
    const y = -scale * (yLabels.length - 1);
    for (let i = 0; i < xLabels.length; i++) {
        const x = scale * i;
        elements.push(new Line({ start: P(x, y), end: P(x, 0), color, classes: 'thin' }));
        const position = P(x, textToLineDistance);
        elements.push(new Text({ position, text: xLabels[i], horizontalAlignment: rotated ? 'right' : 'center', verticalAlignment: rotated ? 'center' : 'top', color, transform: rotated ? rotate(position, -90) : undefined }));
    }
    const x = scale * (xLabels.length - 1);
    for (let i = 0; i < yLabels.length; i++) {
        const y = -scale * i;
        elements.push(new Line({ start: P(0, y), end: P(x, y), color, classes: 'thin' }));
        elements.push(new Text({ position: P(-textToLineDistance, y), text: yLabels[i], horizontalAlignment: 'right', verticalAlignment: 'center', color }));
    }
    const xAxisPosition = P(x / 2, textToLineDistance + (rotated ? estimateTextWidth(xLabels[xLabels.length - 1]) + textToLineDistance : lineHeight));
    elements.push(new Text({ position: xAxisPosition, text: bold(xAxis), horizontalAlignment: 'center', verticalAlignment: 'top', color }));
    const yAxisPosition = P(-2 * textToLineDistance - estimateTextWidth(yLabels[yLabels.length - 1]), y / 2);
    elements.push(new Text({ position: yAxisPosition, text: bold(yAxis), horizontalAlignment: rotated ? 'center' : 'right', verticalAlignment: rotated ? 'bottom' : 'center', color, transform: rotated ? rotate(yAxisPosition, -90) : undefined, ignoreForClipping: rotated }));
    if (rotated) {
        elements.push(new InvisiblePoint({ point: P(x + textHeight / 2, 0) }));
        elements.push(new InvisiblePoint({ point: yAxisPosition.subtractX(textHeight) }));
    }
}
