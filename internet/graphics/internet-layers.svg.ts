import { Color } from '../../typescript/utility/color';

import { BoxSide } from '../../typescript/svg/utility/box';
import { P, Point } from '../../typescript/svg/utility/point';

import { VisualElement } from '../../typescript/svg/elements/element';
import { ConnectionLine } from '../../typescript/svg/elements/line';
import { Rectangle } from '../../typescript/svg/elements/rectangle';
import { printSVG } from '../../typescript/svg/elements/svg';
import { Text } from '../../typescript/svg/elements/text';

const colors: Color[] = ['yellow', 'orange', 'red', 'pink', 'purple'];
const layers = ['Application layer', 'Security layer', 'Transport layer', 'Network layer', 'Link layer'];
const entities = ['Sender', 'Router', 'Recipient'];

const columnDistance = 150;
const rowDistance = 75;
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

function generateSquares(x: number, layer: number) {
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
        elements.push(ConnectionLine(previousSquare, startSide, square!, endSide, { color: previousColor }).shorten(8));
    }
    previousSquare = square;
    previousCenter = center;
    previousColor = colors[layer];
}

layers.forEach((layer, index) => {
    elements.push(new Text({ text: layer, position: P(0, index * rowDistance + offsetTop), color: colors[index], verticalAlignment: 'center' }));
});

entities.forEach((entity, index) => {
    elements.push(new Text({ text: entity, position: P((index + 1) * columnDistance, 0), horizontalAlignment: 'center', verticalAlignment: 'center' }));
});

for (let i = 0; i < 5; i++) {
    generateSquares(columnDistance, i);
}

generateSquares(2 * columnDistance - rowDistance / 2, 4);
generateSquares(2 * columnDistance, 3);
generateSquares(2 * columnDistance + rowDistance / 2, 4);

for (let i = 4; i >= 0; i--) {
    generateSquares(3 * columnDistance, i);
}

printSVG(...elements);
