import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, large, Text } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(bold('Given input 1'));
const horizontalGap = size.y;
const verticalGap = size.y;

const elements = new Array<VisualElement>();

const input1Rectangle = new Rectangle({ position: P(0, 0), size, color: 'blue' });
elements.push(input1Rectangle, input1Rectangle.text(bold('Given input 1')));

const input2Rectangle = new Rectangle({ position: P(0, 2 * verticalGap), size, color: 'green' });
elements.push(input2Rectangle, input2Rectangle.text(bold('Find input 2')));

const outputRectangle = new Rectangle({ position: P(size.x + horizontalGap, verticalGap), size, color: 'blue' });
elements.push(outputRectangle, outputRectangle.text(bold('Same output')));

elements.unshift(Line.connectBoxes(input1Rectangle, 'right', outputRectangle, 'left'));
elements.unshift(Line.connectBoxes(input2Rectangle, 'right', outputRectangle, 'left'));

elements.push(new Text({
    position: P(size.x / 2, verticalGap + size.y / 2 + 1),
    text: large('≠'),
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
}));

printSVG(...elements);
