import { P, zeroPoint } from '../../typescript/svg/utility/point';

import { ConnectionLine } from '../../typescript/svg/elements/line';
import { Rectangle } from '../../typescript/svg/elements/rectangle';
import { printSVG } from '../../typescript/svg/elements/svg';
import { bold, estimateSize } from '../../typescript/svg/elements/text';

const size = estimateSize('Server', 'bold');

const clientRectangle = new Rectangle({ position: zeroPoint, size });
const clientText = clientRectangle.text(bold('Client'));

const serverRectangle = new Rectangle({ position: P(200, 0), size });
const serverText = serverRectangle.text(bold('Server'));

const line = ConnectionLine(clientRectangle, 'right', serverRectangle, 'left');

printSVG(line, clientRectangle, clientText, serverRectangle, serverText);
