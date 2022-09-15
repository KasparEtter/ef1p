/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { doubleStrokeWidth, strokeWidth } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, subscript, T } from '../../../code/svg/elements/text';

const modulus = 3;

const squareSide = 32;
const squareSize = P(squareSide, squareSide);
const rectangleHeight = 3 * squareSide + 4 * doubleStrokeWidth;
const rectangleSize = P(4 / 3 * rectangleHeight, rectangleHeight);

const sourceRingColor = 'blue';
const targetRingColor = 'green';
const quotientRingColor = 'purple';
const homomorphismColor = 'pink';

const elements = new Array<VisualElement>();

const offsets = [
    P(-2 * (squareSide + doubleStrokeWidth), 1 * squareSide + 2 * doubleStrokeWidth),
    P(-1.5 * (squareSide + doubleStrokeWidth), 0 * squareSide + 1 * doubleStrokeWidth),
    P(-1 * (squareSide + doubleStrokeWidth), 1 * squareSide + 2 * doubleStrokeWidth),
    P(-1.5 * (squareSide + doubleStrokeWidth), 2 * squareSide + 3 * doubleStrokeWidth),
];

const offset = P(2 * squareSide, 1 * squareSide + 2 * doubleStrokeWidth);

for (let i = 0; i < modulus; i++) {
    const top = i * (rectangleSize.y + doubleStrokeWidth);
    const rectangle = new Rectangle({ position: P(0, top), size: rectangleSize, color: quotientRingColor });
    elements.push(...rectangle.withText(bold(T(modulus.toString(), 'ℤ', i === 0 ? T(' = 𝕂', subscript('f')) : ' + ' + i)), { horizontalAlignment: 'left' }));
    const topRight = P(rectangleSize.x, top);
    const targetRectangle = new Rectangle({ position:topRight.add(offset), size: squareSize, color: targetRingColor });
    elements.push(...targetRectangle.withText(bold(i.toString())));
    for (let j = 0; j < offsets.length; j++) {
        const sourceRectangle = new Rectangle({ position: topRight.add(offsets[j]), size: squareSize, color: sourceRingColor });
        if (j > 0) {
            elements.push(Line.connectBoxes(sourceRectangle, 'right', targetRectangle, 'left', { color: homomorphismColor }));
            elements.push(...sourceRectangle.withText(bold(((j - 2) * modulus + i).toString().replace('-', '−'))));
        } else {
            elements.push(...sourceRectangle.withText(bold('…')));
        }
    }
}

elements.push(new Rectangle({
    position: P(0, -(squareSide + doubleStrokeWidth)),
    size: P(rectangleSize.x, squareSide),
    color: quotientRingColor,
}).text(bold('ℤ / ' + modulus + 'ℤ'), {
    horizontalAlignment: 'left',
    ignoreForClipping: false,
}));

elements.push(new Rectangle({
    position: P(rectangleSize.x + offsets[1].x, -(squareSide + doubleStrokeWidth)),
    size: squareSize,
    color: sourceRingColor,
}).text(bold('ℤ'), {
    ignoreForClipping: false,
}));

elements.push(new Rectangle({
    position: P(rectangleSize.x + offsets[1].x + squareSide + strokeWidth, -(squareSide + doubleStrokeWidth)),
    size: P(2.5 * squareSide, squareSide),
    color: homomorphismColor,
}).text(bold('f(x) = x % ' + modulus), {
    ignoreForClipping: false,
}));

elements.push(new Rectangle({
    position: P(rectangleSize.x + offset.x, -(squareSide + doubleStrokeWidth)),
    size: squareSize,
    color: targetRingColor,
}).text(bold(T('ℤ', subscript(modulus.toString()))), {
    ignoreForClipping: false,
}));

printSVG(...elements);
