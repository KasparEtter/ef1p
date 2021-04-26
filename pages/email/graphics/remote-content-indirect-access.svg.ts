import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, estimateTextWidthWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(['Proxy', 'server'].map(bold));

const elements = new Array<VisualElement>();

const mailServerRectangle = new Rectangle({ position: P(-size.x * 1.5, 0), size, color: 'blue' });
elements.push(mailServerRectangle, mailServerRectangle.text(['Mail', 'server'].map(bold)));

const proxyServerRectangle = new Rectangle({ position: P(0, 0), size, color: 'blue' });
elements.push(proxyServerRectangle, proxyServerRectangle.text(['Proxy', 'server'].map(bold)));

const mailClientRectangle = new Rectangle({ position: P(0, size.y * 2.5), size, color: 'green' });
elements.push(mailClientRectangle, mailClientRectangle.text(['Mail', 'client'].map(bold)));

const webServerRectangle = new Rectangle({ position: P(size.x + estimateTextWidthWithMargin('3. Fetch', 3), 0), size, color: 'orange' });
elements.push(webServerRectangle, webServerRectangle.text(['Web', 'server'].map(bold)));

const line1 = Line.connectBoxes(mailClientRectangle, 'top', mailServerRectangle, 'bottom');
elements.unshift(line1, line1.text('1. Fetch email'));

const line2 = Line.connectBoxes(mailClientRectangle, 'top', proxyServerRectangle, 'bottom');
elements.unshift(line2, line2.text('2. Fetch content', 'right'));

const line3 = Line.connectBoxes(proxyServerRectangle, 'right', webServerRectangle, 'left');
elements.unshift(line3, line3.text(['3. Fetch', 'content']));

printSVG(...elements);
