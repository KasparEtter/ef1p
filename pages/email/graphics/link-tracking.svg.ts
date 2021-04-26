import { P, zeroPoint } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, estimateTextWidthWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(['Tracking', 'server'].map(bold));
const x = estimateTextWidthWithMargin('2. Open', 3);
const y = size.y * 1.5;

const elements = new Array<VisualElement>();

const mailServerRectangle = new Rectangle({ position: zeroPoint, size, color: 'blue' });
elements.push(mailServerRectangle, mailServerRectangle.text(['Mail', 'server'].map(bold)));

const mailClientRectangle = new Rectangle({ position: P(0, size.y + y), size, color: 'green' });
elements.push(mailClientRectangle, mailClientRectangle.text(['Mail', 'client'].map(bold)));

const webBrowserRectangle = new Rectangle({ position: P(size.x + x, size.y + y), size, color: 'green' });
elements.push(webBrowserRectangle, webBrowserRectangle.text(['Web', 'browser'].map(bold)));

const redirectServerRectangle = new Rectangle({ position: P(size.x + x, 0), size, color: 'orange' });
elements.push(redirectServerRectangle, redirectServerRectangle.text(['Tracking', 'server'].map(bold)));

const webServerRectangle = new Rectangle({ position: P(2 * (size.x + x), 0), size, color: 'orange' });
elements.push(webServerRectangle, webServerRectangle.text(['Web', 'server'].map(bold)));

const line1 = Line.connectBoxes(mailClientRectangle, 'top', mailServerRectangle, 'bottom');
elements.unshift(line1, line1.text('1. Fetch'));

const line2 = Line.connectBoxes(mailClientRectangle, 'right', webBrowserRectangle, 'left');
elements.unshift(line2, line2.text('2. Open'));

const line3 = Line.connectBoxes(webBrowserRectangle, 'top', redirectServerRectangle, 'bottom').moveLeft();
elements.unshift(line3, line3.text('3. Request'));

const line4 = Line.connectBoxes(redirectServerRectangle, 'bottom', webBrowserRectangle, 'top').moveLeft();
elements.unshift(line4, line4.text('4. Redirect'));

const line5 = Line.connectBoxes(webBrowserRectangle, 'right', webServerRectangle, 'bottom');
elements.unshift(line5, line5.text('5. Request', 'right'));

printSVG(...elements);
