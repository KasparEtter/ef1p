import { P, zeroPoint } from '../../../code/svg/utility/point';

import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, estimateTextWidthWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(bold('Server'));

const clientRectangle = new Rectangle({ position: zeroPoint, size });
const clientText = clientRectangle.text(bold('Client'));

const serverRectangle = new Rectangle({ position: P(size.x + estimateTextWidthWithMargin('Response', 3), 0), size });
const serverText = serverRectangle.text(bold('Server'));

const line = Line.connectBoxes(clientRectangle, 'right', serverRectangle, 'left');

printSVG(line, clientRectangle, clientText, serverRectangle, serverText);
