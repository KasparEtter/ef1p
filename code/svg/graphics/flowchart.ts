/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../utility/color';

import { P } from '../utility/point';

import { VisualElement } from '../elements/element';
import { Line } from '../elements/line';
import { Rectangle } from '../elements/rectangle';
import { printSVG } from '../elements/svg';
import { estimateTextSizeWithMargin, TextLine } from '../elements/text';

export const defaultVerticalGap = 24;

export interface Step {
    text: TextLine | TextLine[];
    color?: Color;
}

export function generateFlowchart(
    steps: Step[],
    verticalGap = defaultVerticalGap,
): VisualElement[] {
    const elements = new Array<VisualElement>();
    let y = 0;
    let previousRectangle: Rectangle | undefined;
    for (const step of steps) {
        const size = estimateTextSizeWithMargin(step.text);
        const rectangle = new Rectangle({ position: P(-size.x / 2, y), size, color: step.color });
        elements.push(rectangle, rectangle.text(step.text));
        if (previousRectangle !== undefined) {
            elements.unshift(Line.connectBoxes(previousRectangle, 'bottom', rectangle, 'top'));
        }
        previousRectangle = rectangle;
        y += size.y + verticalGap;
    }
    return elements;
}

export function printFlowchart(
    steps: Step[],
    verticalGap = defaultVerticalGap,
): void {
    const elements = generateFlowchart(steps, verticalGap);
    printSVG(...elements);
}
