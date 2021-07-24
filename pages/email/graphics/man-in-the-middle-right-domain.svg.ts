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
elements.push(...clientRectangle.withText(bold('Client')));

const attackerRectangle = new Rectangle({ position: P(horizontalGap, 0), size, color: 'red' });
elements.push(...attackerRectangle.withText(bold('Server')));

const serverRectangle = new Rectangle({ position: P(2 * horizontalGap, 0), size, color: 'green' });
elements.push(...serverRectangle.withText(bold('Server')));

elements.unshift(Line.connectBoxes(clientRectangle, 'right', attackerRectangle, 'left', { color: 'green' }).move(offset.multiply(-1)));
elements.unshift(Line.connectBoxes(attackerRectangle, 'left', clientRectangle, 'right', { color: 'green' }).move(offset.multiply(1)));

elements.unshift(Line.connectBoxes(attackerRectangle, 'right', serverRectangle, 'left', { color: 'green' }).move(offset.multiply(-1)));
elements.unshift(Line.connectBoxes(serverRectangle, 'left', attackerRectangle, 'right', { color: 'green' }).move(offset.multiply(1)));

elements.unshift(Line.connectBoxes(clientRectangle, 'right', attackerRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(-3)));
elements.unshift(Line.connectBoxes(clientRectangle, 'right', attackerRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(3)));

elements.unshift(Line.connectBoxes(attackerRectangle, 'right', serverRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(-3)));
elements.unshift(Line.connectBoxes(attackerRectangle, 'right', serverRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(3)));

printSVG(...elements);
