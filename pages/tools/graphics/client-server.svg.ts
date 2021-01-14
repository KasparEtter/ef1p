import { P, zeroPoint } from '../../../code/svg/utility/point';

import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateSizeWithMargin(bold('Server'));

const clientRectangle = new Rectangle({ position: zeroPoint, size });
const clientText = clientRectangle.text(bold('Client'));

const serverRectangle = new Rectangle({ position: P(180, 0), size });
const serverText = serverRectangle.text(bold('Server'));

const requestLine = Line.connectBoxes(clientRectangle, 'right', serverRectangle, 'left', { color: 'blue' }).moveLeft();
const requestText = requestLine.text('Request');

const responseLine = Line.connectBoxes(serverRectangle, 'left', clientRectangle, 'right', { color: 'green' }).moveLeft();
const responseText = responseLine.text('Response');

printSVG(requestLine, requestText, responseLine, responseText, clientRectangle, clientText, serverRectangle, serverText);
