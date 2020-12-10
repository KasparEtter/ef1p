import { textToLineDistance } from '../../../code/svg/utility/constants';
import { P, zeroPoint } from '../../../code/svg/utility/point';

import { ConnectionLine } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateSizeWithMargin(bold('Server'));

const clientRectangle = new Rectangle({ position: zeroPoint, size });
const clientText = clientRectangle.text(bold('Client'));

const serverRectangle = new Rectangle({ position: P(200, 0), size });
const serverText = serverRectangle.text(bold('Server'));

const lineOffset = textToLineDistance / 2;

const requestLine = ConnectionLine(clientRectangle, 'right', serverRectangle, 'left', { color: 'blue' }).move(P(0, -lineOffset));
const requestText = requestLine.text('Request', 'left');

const responseLine = ConnectionLine(serverRectangle, 'left', clientRectangle, 'right', { color: 'green' }).move(P(0, lineOffset));
const responseText = responseLine.text('Response', 'left');

printSVG(requestLine, requestText, responseLine, responseText, clientRectangle, clientText, serverRectangle, serverText);
