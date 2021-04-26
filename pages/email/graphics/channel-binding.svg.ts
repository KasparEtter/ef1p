import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(bold('Server'));
const horizontalGap = 2 * size.x;
const offset = P(0, 5);

const elements = new Array<VisualElement>();

const clientRectangle = new Rectangle({ position: P(0, 0), size });
const attackerRectangle = new Rectangle({ position: P(horizontalGap, 0), size, color: 'red' });
const serverRectangle = new Rectangle({ position: P(2 * horizontalGap, 0), size });

elements.push(Line.connectBoxes(clientRectangle, 'right', attackerRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(-3)));
elements.push(Line.connectBoxes(clientRectangle, 'right', attackerRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(3)));

elements.push(Line.connectBoxes(attackerRectangle, 'right', serverRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(-3)));
elements.push(Line.connectBoxes(attackerRectangle, 'right', serverRectangle, 'left', { color: 'blue', marker: [] }).move(offset.multiply(3)));

elements.push(attackerRectangle);

elements.push(Line.connectBoxes(clientRectangle, 'right', serverRectangle, 'left', { color: 'green' }).move(offset.multiply(-1)));
elements.push(Line.connectBoxes(serverRectangle, 'left', clientRectangle, 'right', { color: 'green' }).move(offset.multiply(1)));

elements.push(clientRectangle, clientRectangle.text(bold('Client')));
elements.push(serverRectangle, serverRectangle.text(bold('Server')));

printSVG(...elements);
