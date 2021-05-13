/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { elements, incomingMailServerBox, mailClientBox, outgoingMailServerBox } from './double-submission';

const arc = Arc.connectBoxes(mailClientBox, 'right', outgoingMailServerBox, 'bottom', { color: 'green' });
elements.unshift(arc, arc.text('1. Submit', 'inside'));

const line = Line.connectBoxes(outgoingMailServerBox, 'left', incomingMailServerBox, 'right', { color: 'green' });
elements.unshift(line, line.text('2. Send', 'right'));

printSVG(...elements);
