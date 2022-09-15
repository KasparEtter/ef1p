/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, large, Text } from '../../../code/svg/elements/text';

const labels = ['Web', 'Mail', 'Webmail'];
const entities = ['Mail server', 'Mail client', 'Web server', 'Web browser', 'User'];
const mask = [[2, 3, 4], [0, 1, 4], [0, 1, 2, 3, 4]];

const columnDistance = 180;
const rowDistance = 65;
const offsetTop = 30;
const boxSize = estimateTextSizeWithMargin(bold('A longer word'));

const elements = new Array<VisualElement>();

labels.forEach((label, column) => {
    elements.push(new Text({
        text: bold(label),
        position: P(column * columnDistance, -offsetTop),
        verticalAlignment: 'top',
    }));
    let previousBox: Rectangle | undefined;
    mask[column].forEach(row => {
        const box = new Rectangle({
            position: P(column * columnDistance - boxSize.x / 2, row * rowDistance),
            size: boxSize,
        });
        if (column !== 2 || (row !== 1 && row !== 2)) {
            elements.push(box);
        }
        elements.push(box.text(bold(entities[row])));
        if (previousBox !== undefined && !(column === 2 && row === 2)) {
            elements.push(Line.connectBoxes(box, 'top', previousBox, 'bottom'));
        }
        previousBox = box;
    });
});

elements.push(new Rectangle({
    position: P(2 * columnDistance - boxSize.x / 2, rowDistance),
    size: P(boxSize.x, boxSize.y + rowDistance),
}));

const symbols = [bold('+'), bold('='), '&amp;'];
const point = P(columnDistance / 2, 2 * rowDistance + boxSize.y / 2);
const positions = [
    point,
    point.addX(columnDistance),
    P(2 * columnDistance, rowDistance + boxSize.y + (rowDistance - boxSize.y) / 2),
];

positions.forEach((position, index) => {
    elements.push(new Text({
        text: large(symbols[index]),
        position: position.addY(3),
    }));
});

printSVG(...elements);
