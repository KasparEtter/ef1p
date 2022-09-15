/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { strokeWidth, textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { bold, Text, TextLine } from '../../../code/svg/elements/text';

export const n = 16;
export const k = 11;
export const gap = 35;

export const radius = gap * 0.4;
export const ratio = 0.15;

export const dashRadius = 2 * strokeWidth;
export const textOffset = dashRadius + textToLineDistance;

export const dlpElements = new Array<VisualElement>();
dlpElements.push(new Line({ start: P(gap, 0), end: P(n * gap, 0) }));

export function addLabel(i: number, text: TextLine, color?: Color): void {
    dlpElements.push(new Text({ position: P(i * gap, textOffset), text: bold(text), verticalAlignment: 'top', color }));
}
