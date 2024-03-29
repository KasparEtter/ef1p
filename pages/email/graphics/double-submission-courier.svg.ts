/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { elements, incomingMailServerBox, mailClientBox, outgoingMailServerBox } from './double-submission';

elements.unshift(...Arc.connectBoxes(mailClientBox, 'left', incomingMailServerBox, 'bottom', { color: 'blue', ratio: 0.75 }).withText('1. Store', 'inside'));
elements.unshift(...Line.connectBoxes(incomingMailServerBox, 'right', outgoingMailServerBox, 'left', { color: 'green' }).withText('2. Submit'));

printSVG(...elements);
