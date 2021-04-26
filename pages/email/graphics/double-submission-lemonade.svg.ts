import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { elements, incomingMailServerBox, mailClientBox, outgoingMailServerBox } from './double-submission';

const arc1 = Arc.connectBoxes(mailClientBox, 'left', incomingMailServerBox, 'bottom', { color: 'blue' });
elements.unshift(arc1, arc1.text('1. Store', 'inside'));

const arc2 = Arc.connectBoxes(mailClientBox, 'right', outgoingMailServerBox, 'bottom', { color: 'green' });
elements.unshift(arc2, arc2.text('2. Reference', 'inside'));

const line = Line.connectBoxes(outgoingMailServerBox, 'left', incomingMailServerBox, 'right', { color: 'blue' });
elements.unshift(line, line.text('3. Fetch', 'right'));

printSVG(...elements);
