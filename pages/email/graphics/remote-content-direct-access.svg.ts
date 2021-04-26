import { P, zeroPoint } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(['Mail', 'server'].map(bold));

const elements = new Array<VisualElement>();

const mailServerRectangle = new Rectangle({ position: zeroPoint, size, color: 'blue' });
elements.push(mailServerRectangle, mailServerRectangle.text(['Mail', 'server'].map(bold)));

const mailClientRectangle = new Rectangle({ position: P(size.x, size.y * 2.5), size, color: 'green' });
elements.push(mailClientRectangle, mailClientRectangle.text(['Mail', 'client'].map(bold)));

const webServerRectangle = new Rectangle({ position: P(2 * size.x, 0), size, color: 'orange' });
elements.push(webServerRectangle, webServerRectangle.text(['Web', 'server'].map(bold)));

const line1 = Line.connectBoxes(mailClientRectangle, 'top', mailServerRectangle, 'bottom');
elements.unshift(line1, line1.text('1. Fetch email'));

const line2 = Line.connectBoxes(mailClientRectangle, 'top', webServerRectangle, 'bottom');
elements.unshift(line2, line2.text('2. Fetch content', 'right'));

printSVG(...elements);
