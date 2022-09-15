/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeRadius, textToLineDistance } from '../../../code/svg/utility/constants';
import { Color } from '../../../code/utility/color';

import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Ellipse } from '../../../code/svg/elements/ellipse';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, HorizontalAlignment, Text } from '../../../code/svg/elements/text';

const gapX = 80;
const gapY = 80;
const offsetLabel = 30;
const radius = P(27, 17);
const size = P(168, 58);
const offsetEllipse = 10;

const codeColor: Color = 'pink';
const dataColor: Color = 'orange';

const elements = new Array<VisualElement>();

elements.push(...new Rectangle({ position: P(0, 0), size }).withText(bold('Web server')));
elements.push(...new Rectangle({ position: P(0, size.y + gapY), size }).withText(bold('Web browser')));
elements.push(...new Rectangle({ position: P(size.x + gapX, 0), size }).withText(bold('Mail server')));
elements.push(...new Rectangle({ position: P(size.x + gapX, size.y + gapY), size }).withText(bold('Mail client'), { horizontalAlignment: 'left' }));

const leftX = size.x / 2;
const rightX = size.x + gapX + size.x / 2;
const middleX = size.x + gapX / 2;
const middleY = size.y + gapY / 2;

const y1 = size.y + strokeRadius;
const y2 = middleY - radius.y - strokeRadius;
const y3 = middleY + radius.y + strokeRadius;
const y4 = size.y + gapY - strokeRadius;

const webCodeX = leftX - offsetEllipse - radius.x;
elements.unshift(
    new Line({ start: P(webCodeX, y1), end: P(webCodeX, y2), color: codeColor}),
    new Line({ start: P(webCodeX, y3), end: P(webCodeX, y4), color: codeColor, marker: 'end' }),
    ...new Ellipse({ center: P(webCodeX, middleY), radius, color: codeColor }).withText(bold('Code')),
);

const webDataX = leftX + offsetEllipse + radius.x;
elements.unshift(
    new Line({ start: P(webDataX, y1), end: P(webDataX, y2), color: dataColor, marker: 'start' }),
    new Line({ start: P(webDataX, y3), end: P(webDataX, y4), color: dataColor, marker: 'end' }),
    ...new Ellipse({ center: P(webDataX, middleY), radius, color: dataColor }).withText(bold('Data')),
);

const mailCodeX = 2 * size.x + gapX - textToLineDistance - radius.x;
const mailCodeY = size.y + gapY + size.y / 2;
elements.push(...new Ellipse({ center: P(mailCodeX, mailCodeY), radius, color: codeColor }).withText(bold('Code')));

elements.unshift(
    new Line({ start: P(rightX, y1), end: P(rightX, y2), color: dataColor, marker: 'start' }),
    new Line({ start: P(rightX, y3), end: P(rightX, y4), color: dataColor, marker: 'end' }),
    ...new Ellipse({ center: P(rightX, middleY), radius, color: dataColor }).withText(bold('Data')),
);

elements.push(new Text({
    text: bold('Web'),
    position: P(leftX, -offsetLabel),
    verticalAlignment: 'top',
}));

elements.push(new Text({
    text: bold('Mail'),
    position: P(rightX, -offsetLabel),
    verticalAlignment: 'top',
}));

elements.push(new Text({
    text: bold('vs.'),
    position: P(middleX, middleY),
}));

printSVG(...elements);
