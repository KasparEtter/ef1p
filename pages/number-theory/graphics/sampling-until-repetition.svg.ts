/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { textHeight, textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { InvisiblePoint } from '../../../code/svg/elements/invisible';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { Text } from '../../../code/svg/elements/text';
import { rotate } from '../../../code/svg/utility/transform';

const n = 5;

const scaleY = 40;
const scaleX = scaleY * (n + 1);

const nonRepetitionColor: Color = 'blue';
const repetitionColor: Color = 'green';

function factorial(n: number) {
    let result = 1;
    for (let i = n; i > 0; i--) {
        result *= i;
    }
    return result;
}

function columnWidth(i: number) {
    return (i - 1) * factorial(n) / (factorial(n - i + 1) * n**i);
}

let x = 0;
const xs = Array.from({ length: n }, (_, i) => {
    x += columnWidth(i + 2);
    return x;
});
xs.unshift(0);

const elements = new Array<VisualElement>();

for (let i = 0; i <= n; i++) {
    if (i > 0) {
        elements.push(new Rectangle({
            position: P(xs[i - 1] * scaleX, i * scaleY),
            size: P((xs[i] - xs[i - 1]) * scaleX, scaleY),
            cornerRadius: 0,
            color: repetitionColor,
            classes: ['filled', 'beta'],
        }));
    }
    if (i < n) {
        elements.push(new Rectangle({
            position: P(xs[i] * scaleX, i * scaleY),
            size: P((1 - xs[i]) * scaleX, scaleY),
            cornerRadius: 0,
            color: nonRepetitionColor,
            classes: ['filled', 'beta'],
        }));
    }
    elements.push(new Text({
        position: P(-textToLineDistance, (i + 0.5) * scaleY),
        text: (i + 1).toString(),
        horizontalAlignment: 'right',
    }));
}

for (let i = 0; i <= n + 1; i++) {
    elements.push(new Line({
        start: P(0, i * scaleY),
        end: P(scaleX, i * scaleY),
        classes: 'thin',
    }));
}

for (const x of xs) {
    elements.push(new Line({
        start: P(x * scaleX, 0),
        end: P(x * scaleX, (n + 1) * scaleY),
        classes: 'thin',
    }));
}

for (const x of [0, 1]) {
    elements.push(new Text({
        position: P(x * scaleX, -textToLineDistance),
        text: x.toString(),
        verticalAlignment: 'bottom',
    }));
}

elements.push(new Text({
    position: P(0.5 * scaleX, -textToLineDistance),
    text: 'Probability',
    verticalAlignment: 'bottom',
}));

elements.push(new Text({
    position: P(0.5 * scaleX, (n + 1) * scaleY + textToLineDistance),
    text: `n = ${n}`,
    verticalAlignment: 'top',
}));

const position = P(-textToLineDistance * 2.75, (n + 1) / 2 * scaleY);
elements.push(new Text({
    position,
    text: 'Iterations',
    verticalAlignment: 'bottom',
    ignoreForClipping: true,
    transform: rotate(position, -90),
}));

elements.push(new InvisiblePoint({ point: P(position.x - textHeight, 0) }));

printSVG(...elements);
