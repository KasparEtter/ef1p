import { Point } from './point';

export const indentation = '    ';

export const strokeWidth = 2.5;
export const strokeWidthMargin = new Point(strokeWidth, strokeWidth);
export const strokeRadius = strokeWidth / 2;
export const strokeRadiusMargin = new Point(strokeRadius, strokeRadius);

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
export const singleLineWithMarginHeight = textHeight + doubleTextMargin.y;
