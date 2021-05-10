/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { elements, incomingMailServerBox, mailClientBox, outgoingMailServerBox } from './double-submission';

const arc1 = Arc.connectBoxes(mailClientBox, 'right', outgoingMailServerBox, 'bottom', { color: 'green' });
elements.unshift(arc1, arc1.text('1. Submit', 'inside'));

const line = Line.connectBoxes(outgoingMailServerBox, 'left', incomingMailServerBox, 'right', { color: 'red' });
elements.unshift(line, line.text('2. Report', 'right'));

const arc2 = Arc.connectBoxes(mailClientBox, 'left', incomingMailServerBox, 'bottom', { color: 'blue' });
elements.unshift(arc2, arc2.text('3. Retrieve', 'inside'));

printSVG(...elements);
