/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { strokeWidth, textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { Arc } from '../../../code/svg/elements/arc';
import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, superscript, T, Text, TextLine } from '../../../code/svg/elements/text';

const e = 3;
const x = 1;
const scale = 35;

const largerColor: Color = 'green';
const smallerColor: Color = 'blue';

const dashRadius = 2 * strokeWidth;
const textOffset = dashRadius + textToLineDistance;

const classes = 'thick';

const elements = new Array<VisualElement>();

function addLargerArrow(start: number, end: number): void {
    elements.push(new Arc({
        start: P(start * scale, -dashRadius),
        startSide: 'top',
        end: P(end * scale, -dashRadius),
        endSide: 'top',
        radius: 2 * scale,
        marker: 'end',
        color: largerColor,
    }));
    for (const position of [start, end]) {
        elements.push(new Line({
            start: P(position * scale, -dashRadius),
            end: P(position * scale, -strokeWidth),
            color: largerColor,
            classes,
        }));
    }
}

addLargerArrow(x + 2**e, x);
addLargerArrow(2**(e+1) - x, 2**e - x);
elements.push(new Text({ position: P(2**e * scale, -2 * scale), text: bold(T('±2', superscript('e'))), verticalAlignment: 'bottom', color: largerColor }));

function addSmallerArrow(start: number, end: number): void {
    elements.push(new Arc({
        start: P(start * scale, dashRadius),
        startSide: 'bottom',
        end: P(end * scale, dashRadius),
        endSide: 'bottom',
        radius: 1.5 * scale,
        marker: 'end',
        color: smallerColor,
    }));
    for (const position of [start, end]) {
        elements.push(new Line({
            start: P(position * scale, dashRadius),
            end: P(position * scale, strokeWidth),
            color: smallerColor,
            classes,
        }));
    }
}

addSmallerArrow(x + 2**(e-1), x);
addSmallerArrow(2**(e-1) - x, 2**e - x);
elements.push(new Text({ position: P(2**(e-1) * scale, 1.9 * scale), text: bold(T('±2', superscript('e−1'))), verticalAlignment: 'top', color: smallerColor }));

function addLabel(i: number, text: TextLine, color?: Color): void {
    elements.push(new Line({
        start: P(i * scale, -dashRadius),
        end: P(i * scale, dashRadius),
        color,
    }));
    elements.push(new Text({ position: P(i * scale, textOffset), text: bold(text), verticalAlignment: 'top', color }));
}

elements.push(new Line({ start: P(0, 0), end: P(2**(e+1) * scale, 0) }));

addLabel(0, '0');
addLabel(2**(e-1), T('2', superscript('e−1')));
addLabel(2**e, T('2', superscript('e')), smallerColor);
addLabel(2**(e+1), T('2', superscript('e+1')), largerColor);

printSVG(...elements);
