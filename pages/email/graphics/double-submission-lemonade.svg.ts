/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { elements, incomingMailServerBox, mailClientBox, outgoingMailServerBox } from './double-submission';

elements.unshift(...Arc.connectBoxes(mailClientBox, 'left', incomingMailServerBox, 'bottom', { color: 'blue' }).withText('1. Store', 'inside'));
elements.unshift(...Arc.connectBoxes(mailClientBox, 'right', outgoingMailServerBox, 'bottom', { color: 'green' }).withText('2. Reference', 'inside'));
elements.unshift(...Line.connectBoxes(outgoingMailServerBox, 'left', incomingMailServerBox, 'right', { color: 'blue' }).withText('3. Fetch', 'right'));

printSVG(...elements);
