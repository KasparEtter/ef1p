import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { elements, incomingMailServerBox, mailClientBox, outgoingMailServerBox } from './double-submission';

const arc = Arc.connectBoxes(mailClientBox, 'right', outgoingMailServerBox, 'bottom', { color: 'green' });
elements.unshift(arc, arc.text('1. Submit', 'inside'));

const line = Line.connectBoxes(outgoingMailServerBox, 'left', incomingMailServerBox, 'right', { color: 'blue' });
elements.unshift(line, line.text('2. Store', 'right'));

printSVG(...elements);
