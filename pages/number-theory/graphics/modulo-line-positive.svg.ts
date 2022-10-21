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

const n = 3.75;
const gap = 80;
const arrowOffset = 3 * strokeWidth;
const dashRadius = arrowOffset;
const textOffset = dashRadius + textToLineDistance;

const elements = new Array<VisualElement>();

elements.push(new Line({ start: P(0, 0), end: P(4.5 * gap, 0), marker: 'end' }));
elements.push(...new Line({ start: P(0, -arrowOffset), end: P(3 * gap, -arrowOffset), marker: 'end', color: 'blue' }).withText(bold('q · d')));
elements.push(...new Line({ start: P(3 * gap, -arrowOffset), end: P(n * gap, -arrowOffset), marker: 'end', color: 'green' }).withText('r'));

const labels = ['0', 'd', '2d', 'q · d', '(q + 1)d'];
for (let i = 0; i < labels.length; i++) {
    elements.push(new Line({ start: P(i * gap, -dashRadius), end: P(i * gap, dashRadius) }));
    elements.push(new Text({ position: P(i * gap, textOffset), text: bold(labels[i]), verticalAlignment: 'top' }));
}

elements.push(new Text({ position: P(2.5 * gap, textOffset), text: bold('…'), verticalAlignment: 'top' }));
elements.push(new Text({ position: P(2.5 * gap, -textOffset), text: bold('+'), verticalAlignment: 'bottom' }));
elements.push(new Text({ position: P(3.555 * gap, -textOffset), text: bold('='), verticalAlignment: 'bottom' }));

elements.push(new Line({ start: P(n * gap, -dashRadius), end: P(n * gap, dashRadius), color: 'pink' }));
elements.push(new Text({ position: P(n * gap, -textOffset), text: bold('n'), verticalAlignment: 'bottom', color: 'pink' }));

printSVG(...elements);
