import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { elements, incomingMailServerBox, mailClientBox, outgoingMailServerBox } from './double-submission';

const arc = Arc.connectBoxes(mailClientBox, 'left', incomingMailServerBox, 'bottom', { color: 'blue' });
elements.unshift(arc, arc.text('1. Store', 'inside'));

const line = Line.connectBoxes(incomingMailServerBox, 'right', outgoingMailServerBox, 'left', { color: 'green' });
elements.unshift(line, line.text('2. Submit'));

printSVG(...elements);
