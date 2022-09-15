/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { printSVG } from '../../../code/svg/elements/svg';

import { addGrid } from '../../../code/svg/graphics/grid';

const p = 19;
const a = -1;
const b = 1;

const scale = 28;
const radius = 5;
const color = 'blue';
const classes = 'filled';

function curve(x: number): number {
    return  (x * x * x + a * x + b) % p;
}

const squareRoots = new Array<number | undefined>(p);
for (let y = 0; y < p / 2; y++) {
    squareRoots[(y * y) % p] = y;
}

const elements = new Array<VisualElement>();
const labels = Array.from({ length: p }, (_, i) => i.toString());
addGrid(elements, scale, 'x', labels, 'y', labels, 'gray');

for (let x = 0; x < p; x++) {
    const y = squareRoots[curve(x)];
    if (y !== undefined) {
        elements.push(new Circle({ center: P(scale * x, -scale * y), radius, color, classes }));
        if (y !== 0) {
            elements.push(new Circle({ center: P(scale * x, -scale * (p - y)), radius, color, classes }));
        }
    }
}

printSVG(...elements);
