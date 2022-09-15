/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeRadius, strokeWidth, textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, Text } from '../../../code/svg/elements/text';

const scale = 15;
const shortTick = 2 * strokeWidth;
const longTick = 2 * shortTick;
const textOffset = longTick + textToLineDistance;

const modulus1 = 5;
const modulus2 = 7;
const product = modulus1 * modulus2;

const elements = new Array<VisualElement>();

for (let i = 1; i < product; i++) {
    elements.push(new Line({ start: P(i * scale, -shortTick), end: P(i * scale, shortTick), classes: 'thin' }));
}

for (let i = 0; i <= modulus2; i++) {
    const value = i * modulus1;
    const x = value * scale;
    elements.push(new Line({ start: P(x, -longTick), end: P(x, -strokeRadius), color: 'blue' }));
    elements.push(new Text({ position: P(x, -textOffset), text: bold(value.toString()), verticalAlignment: 'bottom', color: 'blue' }));
}

for (let i = 0; i <= modulus1; i++) {
    const value = i * modulus2;
    const x = value * scale;
    elements.push(new Line({ start: P(x, strokeRadius), end: P(x, longTick), color: 'green' }));
    elements.push(new Text({ position: P(x, textOffset), text: bold(value.toString()), verticalAlignment: 'top', color: 'green' }));
}

elements.push(new Line({ start: P(-scale, 0), end: P((product + 1) * scale, 0), marker: 'end' }));

printSVG(...elements);
