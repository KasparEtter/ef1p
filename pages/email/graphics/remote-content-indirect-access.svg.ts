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
import { bold, estimateTextSizeWithMargin, estimateTextWidthWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(['Proxy', 'server'].map(bold));

const elements = new Array<VisualElement>();

const mailServerRectangle = new Rectangle({ position: P(-size.x * 1.5, 0), size, color: 'blue' });
elements.push(...mailServerRectangle.withText(['Mail', 'server'].map(bold)));

const proxyServerRectangle = new Rectangle({ position: P(0, 0), size, color: 'blue' });
elements.push(...proxyServerRectangle.withText(['Proxy', 'server'].map(bold)));

const mailClientRectangle = new Rectangle({ position: P(0, size.y * 2.5), size, color: 'green' });
elements.push(...mailClientRectangle.withText(['Mail', 'client'].map(bold)));

const webServerRectangle = new Rectangle({ position: P(size.x + estimateTextWidthWithMargin('3. Fetch', 3), 0), size, color: 'orange' });
elements.push(...webServerRectangle.withText(['Web', 'server'].map(bold)));

elements.unshift(...Line.connectBoxes(mailClientRectangle, 'top', mailServerRectangle, 'bottom').withText('1. Fetch email'));
elements.unshift(...Line.connectBoxes(mailClientRectangle, 'top', proxyServerRectangle, 'bottom').withText('2. Fetch content', 'right'));
elements.unshift(...Line.connectBoxes(proxyServerRectangle, 'right', webServerRectangle, 'left').withText(['3. Fetch', 'content']));

printSVG(...elements);
