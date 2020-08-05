import { P, zeroPoint } from '../../typescript/svg/utility/point';

import { InvisiblePoint } from '../../typescript/svg/elements/invisible';
import { ConnectionLine } from '../../typescript/svg/elements/line';
import { Rectangle } from '../../typescript/svg/elements/rectangle';
import { printSVG } from '../../typescript/svg/elements/svg';
import { bold, estimateSize, textHeight } from '../../typescript/svg/elements/text';

const size = estimateSize('Server', 'bold');

const clientRectangle = new Rectangle({ position: zeroPoint, size });
const clientText = clientRectangle.text(bold('Client'));

const serverRectangle = new Rectangle({ position: P(200, 0), size });
const serverText = serverRectangle.text(bold('Server'));

const lineOffset = 6;

const requestLine = ConnectionLine(clientRectangle, 'right', serverRectangle, 'left', { color: 'blue' }).move(P(0, -lineOffset));
const requestText = requestLine.text('Request', 'left', 10);

const responseLine = ConnectionLine(serverRectangle, 'left', clientRectangle, 'right', { color: 'green' }).move(P(0, lineOffset));
const responseText = responseLine.text('Response', 'left', 10);

const point1 = new InvisiblePoint({ point: P(0, -textHeight + 5) });
const point2 = new InvisiblePoint({ point: P(0, size.y + textHeight - 2) });

printSVG(requestLine, requestText, responseLine, responseText, clientRectangle, clientText, serverRectangle, serverText, point1, point2);
