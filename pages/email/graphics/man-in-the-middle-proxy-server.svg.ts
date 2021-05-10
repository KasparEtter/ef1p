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
import { bold, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(bold('Attacker'));
const horizontalGap = 2 * size.x;
const offset = P(0, 5);

const elements = new Array<VisualElement>();

const clientRectangle = new Rectangle({ position: P(0, 0), size });
elements.push(clientRectangle, clientRectangle.text(bold('Client')));

const proxyRectangle = new Rectangle({ position: P(horizontalGap, 0), size });
elements.push(proxyRectangle, proxyRectangle.text(bold('Proxy')));

const serverRectangle = new Rectangle({ position: P(2 * horizontalGap, 0), size });
elements.push(serverRectangle, serverRectangle.text(bold('Server')));

elements.unshift(Line.connectBoxes(clientRectangle, 'right', proxyRectangle, 'left', { color: 'green' }).move(offset.multiply(-1)));
elements.unshift(Line.connectBoxes(proxyRectangle, 'left', clientRectangle, 'right', { color: 'green' }).move(offset.multiply(1)));

elements.unshift(Line.connectBoxes(proxyRectangle, 'right', serverRectangle, 'left', { color: 'red' }).move(offset.multiply(-1)));
elements.unshift(Line.connectBoxes(serverRectangle, 'left', proxyRectangle, 'right', { color: 'red' }).move(offset.multiply(1)));

elements.unshift(Line.connectBoxes(clientRectangle, 'right', proxyRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(-3)));
elements.unshift(Line.connectBoxes(clientRectangle, 'right', proxyRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(3)));

printSVG(...elements);
