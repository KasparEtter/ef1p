import { Point } from './point';

export const strokeWidth = 2.5;
export const strokeWidthMargin = new Point(strokeWidth, strokeWidth);
export const strokeRadius = strokeWidth / 2;
export const strokeRadiusMargin = new Point(strokeRadius, strokeRadius);

export const defaultCornerRadius = 8;

export const lineToTextDistance = 14;
export const textMargin = new Point(12, 14);
export const doubleTextMargin = textMargin.multiply(2);
