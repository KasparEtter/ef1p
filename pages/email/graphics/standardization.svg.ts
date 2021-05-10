/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, Text } from '../../../code/svg/elements/text';

const sides = ['Sender', 'Recipient'];
const entities = ['Server', 'Client', 'User'];
const colors: Color[] = ['green', 'blue', 'gray'];

const boxSize = estimateTextSizeWithMargin(bold(entities[0]));
const gap = 30;
const columnDistance = boxSize.x + gap;
const rowDistance = boxSize.y + gap;
const offsetTop = 30;

const elements = new Array<VisualElement>();
const boxes = new Array<Rectangle[]>();

sides.forEach((side, column) => {
    elements.push(new Text({
        text: bold(side),
        position: P(column * columnDistance, -offsetTop),
        horizontalAlignment: 'center',
        verticalAlignment: 'top',
    }));
    boxes.push(new Array<Rectangle>());
    entities.forEach((entity, row) => {
        const box = new Rectangle({
            position: P(column * columnDistance - boxSize.x / 2, row * rowDistance),
            size: boxSize,
            color: row === 2 ? 'gray' : undefined,
        });
        boxes[column].push(box);
        if (row > 0) {
            elements.unshift(Line.connectBoxes(box, 'top', boxes[column][row - 1], 'bottom', { color: colors[row] }));
        }
        elements.push(box, box.text(bold(entity)));
    });
});

elements.unshift(Line.connectBoxes(boxes[0][0], 'right', boxes[1][0], 'left', { color: colors[0] }));

printSVG(...elements);
