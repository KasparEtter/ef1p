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

const horizontalAlignment: HorizontalAlignment = 'left';

const elements = new Array<VisualElement>();

const webServerRectangle = new Rectangle({ position: P(0, 0), size });
elements.push(webServerRectangle, webServerRectangle.text(bold('Web server')));

const webBrowserRectangle = new Rectangle({ position: P(0, size.y + gapY), size });
elements.push(webBrowserRectangle, webBrowserRectangle.text(bold('Web browser')));

const mailServerRectangle = new Rectangle({ position: P(size.x + gapX, 0), size });
elements.push(mailServerRectangle, mailServerRectangle.text(bold('Mail server')));

const mailClientRectangle = new Rectangle({ position: P(size.x + gapX, size.y + gapY), size });
elements.push(mailClientRectangle, mailClientRectangle.text(bold('Mail client'), { horizontalAlignment }));

const leftX = size.x / 2;
const rightX = size.x + gapX + size.x / 2;
const middleX = size.x + gapX / 2;
const middleY = size.y + gapY / 2;

const y1 = size.y + strokeRadius;
const y2 = middleY - radius.y - strokeRadius;
const y3 = middleY + radius.y + strokeRadius;
const y4 = size.y + gapY - strokeRadius;

const webCodeX = leftX - offsetEllipse - radius.x;
const webCodeEllipse = new Ellipse({ center: P(webCodeX, middleY), radius, color: codeColor });
elements.unshift(
    new Line({ start: P(webCodeX, y1), end: P(webCodeX, y2), color: codeColor}),
    new Line({ start: P(webCodeX, y3), end: P(webCodeX, y4), color: codeColor, marker: 'end' }),
    webCodeEllipse,
    webCodeEllipse.text(bold('Code')),
);

const webDataX = leftX + offsetEllipse + radius.x;
const webDataEllipse = new Ellipse({ center: P(webDataX, middleY), radius, color: dataColor });
elements.unshift(
    new Line({ start: P(webDataX, y1), end: P(webDataX, y2), color: dataColor, marker: 'start' }),
    new Line({ start: P(webDataX, y3), end: P(webDataX, y4), color: dataColor, marker: 'end' }),
    webDataEllipse,
    webDataEllipse.text(bold('Data')),
);

const mailCodeX = 2 * size.x + gapX - textToLineDistance - radius.x;
const mailCodeY = size.y + gapY + size.y / 2;
const mailCodeEllipse = new Ellipse({ center: P(mailCodeX, mailCodeY), radius, color: codeColor });
elements.push(mailCodeEllipse, mailCodeEllipse.text(bold('Code')));

const mailDataEllipse = new Ellipse({ center: P(rightX, middleY), radius, color: dataColor });
elements.unshift(
    new Line({ start: P(rightX, y1), end: P(rightX, y2), color: dataColor, marker: 'start' }),
    new Line({ start: P(rightX, y3), end: P(rightX, y4), color: dataColor, marker: 'end' }),
    mailDataEllipse,
    mailDataEllipse.text(bold('Data')),
);

elements.push(new Text({
    text: bold('Web'),
    position: P(leftX, -offsetLabel),
    horizontalAlignment: 'center',
    verticalAlignment: 'top',
}));

elements.push(new Text({
    text: bold('Mail'),
    position: P(rightX, -offsetLabel),
    horizontalAlignment: 'center',
    verticalAlignment: 'top',
}));

elements.push(new Text({
    text: bold('vs.'),
    position: P(middleX, middleY),
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
}));

printSVG(...elements);
