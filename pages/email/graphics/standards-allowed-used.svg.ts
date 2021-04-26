import { P, zeroPoint } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { printSVG } from '../../../code/svg/elements/svg';
import { estimateTextSizeWithMargin, Text } from '../../../code/svg/elements/text';

const allowedString = 'What a standard allows';

const allowedRadius = 50;

const allowedCircle = new Circle({
    center: zeroPoint,
    radius: allowedRadius,
    color: 'green',
});

const allowedText = new Text({
    position: P(-allowedRadius - estimateTextSizeWithMargin(allowedString).x, 0),
    text: allowedString,
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    color: 'green',
});

const usedString = 'What is actually being used';

const usedRadius = 20;

const usedCircle = new Circle({
    center: P(allowedRadius - usedRadius / 2, 0),
    radius: usedRadius,
    color: 'blue',
});

const usedText = new Text({
    position: P(allowedRadius + usedRadius / 2 + estimateTextSizeWithMargin(usedString).x - 8, 0),
    text: usedString,
    horizontalAlignment: 'right',
    verticalAlignment: 'center',
    color: 'blue',
});

printSVG(allowedCircle, allowedText, usedCircle, usedText);
