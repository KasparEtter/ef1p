/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

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
elements.push(...mailServerRectangle.withText(['Mail', 'server'].map(bold)));

const mailClientRectangle = new Rectangle({ position: P(0, size.y + y), size, color: 'green' });
elements.push(...mailClientRectangle.withText(['Mail', 'client'].map(bold)));

const webBrowserRectangle = new Rectangle({ position: P(size.x + x, size.y + y), size, color: 'green' });
elements.push(...webBrowserRectangle.withText(['Web', 'browser'].map(bold)));

const redirectServerRectangle = new Rectangle({ position: P(size.x + x, 0), size, color: 'orange' });
elements.push(...redirectServerRectangle.withText(['Tracking', 'server'].map(bold)));

const webServerRectangle = new Rectangle({ position: P(2 * (size.x + x), 0), size, color: 'orange' });
elements.push(...webServerRectangle.withText(['Web', 'server'].map(bold)));

elements.unshift(...Line.connectBoxes(mailClientRectangle, 'top', mailServerRectangle, 'bottom').withText('1. Fetch'));
elements.unshift(...Line.connectBoxes(mailClientRectangle, 'right', webBrowserRectangle, 'left').withText('2. Open'));
elements.unshift(...Line.connectBoxes(webBrowserRectangle, 'top', redirectServerRectangle, 'bottom').moveLeft().withText('3. Request'));
elements.unshift(...Line.connectBoxes(redirectServerRectangle, 'bottom', webBrowserRectangle, 'top').moveLeft().withText('4. Redirect'));
elements.unshift(...Line.connectBoxes(webBrowserRectangle, 'right', webServerRectangle, 'bottom').withText('5. Request', 'right'));

printSVG(...elements);
