/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Point } from './point';

export const indentation = '    ';

export const strokeWidth = 2.5;
export const strokeWidthMargin = new Point(strokeWidth, strokeWidth);
export const doubleStrokeWidth = strokeWidth * 2;
export const strokeRadius = strokeWidth / 2;
export const strokeRadiusMargin = new Point(strokeRadius, strokeRadius);
export const circleRadius = 1.5;

export const defaultCornerRadius = 8;

export const textHeight = 11.5;
export const lineHeight = 22;

export function getTextHeight(numberOfLines: number): number {
    if (numberOfLines < 1) {
        throw new Error('The number of lines has to be positive.');
    }
    return textHeight + (numberOfLines - 1) * lineHeight;
}

export const textMargin = new Point(12, 14);
export const doubleTextMargin = textMargin.multiply(2);
export const textToLineDistance = 12;
export const singleLineWithMarginHeight = getTextHeight(1) + doubleTextMargin.y;
export const doubleLineWithMarginHeight = getTextHeight(2) + doubleTextMargin.y;
export const tripleLineWithMarginHeight = getTextHeight(3) + doubleTextMargin.y;
