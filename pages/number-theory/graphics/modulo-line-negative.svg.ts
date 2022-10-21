/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeWidth, textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, Text } from '../../../code/svg/elements/text';

const n = -3.25;
const gap = 80;
const arrowOffset = 3 * strokeWidth;
const dashRadius = 2 * arrowOffset;
const textOffset = dashRadius + textToLineDistance;

const elements = new Array<VisualElement>();

elements.push(new Line({ start: P(0, 0), end: P(-4.5 * gap, 0), marker: 'end' }));
elements.push(new Line({ start: P(0, -arrowOffset), end: P(-4 * gap, -arrowOffset), marker: 'end', color: 'blue' }));
elements.push(new Line({ start: P(-4 * gap, -2 * arrowOffset), end: P(n * gap, -2 * arrowOffset), marker: 'end', color: 'green' }));

const labels = ['0', '–d', '–2d', '(q + 1)d', 'q · d'];
for (let i = 0; i < labels.length; i++) {
    elements.push(new Line({ start: P(-i * gap, -dashRadius), end: P(-i * gap, arrowOffset) }));
    elements.push(new Text({ position: P(-i * gap, arrowOffset + textToLineDistance), text: bold(labels[i]), verticalAlignment: 'top' }));
}

elements.push(new Text({ position: P(-2.42 * gap, arrowOffset + textToLineDistance), text: bold('…'), verticalAlignment: 'top' }));

elements.push(new Text({ position: P(-4 * gap, -textOffset), text: bold('q · d'), verticalAlignment: 'bottom', color: 'blue' }));
elements.push(new Text({ position: P(-3.71 * gap, -textOffset), text: bold('+'), verticalAlignment: 'bottom' }));
elements.push(new Text({ position: P(-3.56 * gap, -textOffset), text: bold('r'), verticalAlignment: 'bottom', color: 'green' }));
elements.push(new Text({ position: P(-3.41 * gap, -textOffset), text: bold('='), verticalAlignment: 'bottom' }));

elements.push(new Line({ start: P(n * gap, -dashRadius), end: P(n * gap, arrowOffset), color: 'pink' }));
elements.push(new Text({ position: P(n * gap, -textOffset), text: bold('n'), verticalAlignment: 'bottom', color: 'pink' }));

printSVG(...elements);
