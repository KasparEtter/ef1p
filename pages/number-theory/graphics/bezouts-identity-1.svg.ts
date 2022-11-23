/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { strokeWidth } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, Text } from '../../../code/svg/elements/text';

import { a, arrowOffset, b, dashRadius, gcd, max, scale, textOffset } from './bezouts-identity';

const elements = new Array<VisualElement>();

elements.push(new Line({
    start: P(0, 0),
    end: P(max * scale, 0),
    marker: 'end',
}));

elements.push(...new Line({ start: P(0, -arrowOffset), end: P(gcd * scale, -arrowOffset), marker: ['start', 'end'], color: 'pink' }).withText(bold('gcd')));

for (let i = 0; i < max; i++) {
    if (i !== a && i !== b) {
        elements.push(new Line({
            start: P(i * scale, strokeWidth / 2),
            end: P(i * scale, dashRadius),
        }));
    }
    elements.push(new Text({
        position: P(i * scale, textOffset),
        text: bold(i.toString()),
        verticalAlignment: 'top',
    }));
}

for (let i = 0; i < max; i += gcd) {
    if (i !== a && i !== b) {
        elements.push(new Line({
            start: P(i * scale, -strokeWidth / 2),
            end: P(i * scale, -dashRadius),
        }));
    }
    elements.push(new Text({
        position: P(i * scale, textOffset),
        text: bold(i.toString()),
        verticalAlignment: 'top',
    }));
}

function addLabel(i: number, label: string, color: Color) {
    elements.push(new Line({
        start: P(i * scale, -dashRadius),
        end: P(i * scale, dashRadius),
        color,
    }));
    elements.push(new Text({
        position: P(i * scale, -textOffset),
        text: bold(label),
        verticalAlignment: 'bottom',
        color,
    }));
}

addLabel(a, 'a', 'blue');
addLabel(b, 'b', 'green');

printSVG(...elements);
