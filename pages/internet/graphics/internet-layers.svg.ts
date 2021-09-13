/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { BoxSide } from '../../../code/svg/utility/box';
import { P, Point } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { Text } from '../../../code/svg/elements/text';
import { strokeRadius } from '../../../code/svg/utility/constants';

const colors: Color[] = ['yellow', 'orange', 'red', 'pink', 'purple'];
const layers = ['Application layer', 'Security layer', 'Transport layer', 'Network layer', 'Link layer'];
const entities = ['Sender', 'Router', 'Recipient'];

const columnDistance = 140;
const rowDistance = 70;
const offsetTop = 35;

const cornerRadius = 0;
const classes = 'angular';
const squareSize = P(9, 9);
const halfSquareSize = squareSize.divide(2);
const squareGap = P(4.5, 4.5);
const doubleSquareGap = squareGap.multiply(2);

const elements = new Array<VisualElement>();

let previousSquare: Rectangle | undefined;
let previousCenter: Point | undefined;
let previousColor: Color | undefined;

function generateSquares(x: number, layer: number, shorten = 5) {
    const center = P(x, layer * rowDistance + offsetTop);
    let position = center.subtract(halfSquareSize);
    let size = squareSize;
    let square: Rectangle | undefined;
    for (let i = 0; i <= layer; i++) {
        square = new Rectangle({ position, size, cornerRadius, color: colors[i], classes });
        position = position.subtract(squareGap);
        size = size.add(doubleSquareGap);
        elements.push(square);
    }
    if (previousSquare && previousCenter && previousColor) {
        let startSide: BoxSide;
        let endSide: BoxSide;
        if (previousCenter.y < center.y) {
            startSide = 'bottom';
            endSide = 'top';
        } else if (previousCenter.y > center.y) {
            startSide = 'top';
            endSide = 'bottom';
        } else {
            startSide = 'right';
            endSide = 'left';
        }
        elements.push(Line.connectBoxes(previousSquare, startSide, square!, endSide, { color: previousColor }, undefined, 2 * strokeRadius, strokeRadius).shorten(shorten));
    }
    previousSquare = square;
    previousCenter = center;
    previousColor = colors[layer];
}

layers.forEach((layer, index) => {
    elements.push(new Text({ text: layer, position: P(0, index * rowDistance + offsetTop), color: colors[index], verticalAlignment: 'middle' }));
});

entities.forEach((entity, index) => {
    elements.push(new Text({ text: entity, position: P((index + 1) * columnDistance, 0), horizontalAlignment: 'middle', verticalAlignment: 'middle' }));
});

for (let i = 0; i < 5; i++) {
    generateSquares(columnDistance, i);
}

generateSquares(2 * columnDistance - rowDistance / 2, 4);
generateSquares(2 * columnDistance, 3, 7);
generateSquares(2 * columnDistance + rowDistance / 2, 4, 7);

for (let i = 4; i >= 0; i--) {
    generateSquares(3 * columnDistance, i);
}

printSVG(...elements);
