/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Arc } from '../../../code/svg/elements/arc';
import { printSVG } from '../../../code/svg/elements/svg';
import { T } from '../../../code/svg/elements/text';

import { elements, incomingMailServerOfRecipientBox, mailClientOfSenderBox, outgoingMailServerOfRecipientBox, outgoingMailServerOfSenderBox, SMTP } from './simplified-architecture';

elements.push(...outgoingMailServerOfSenderBox.cross(0, 'red'));
elements.push(...outgoingMailServerOfRecipientBox.cross(0, 'gray'));

elements.splice(
    elements.indexOf(mailClientOfSenderBox),
    0,
    ...Arc.connectBoxes(mailClientOfSenderBox, 'top', incomingMailServerOfRecipientBox, 'left', { color: 'red' }).withText([T(SMTP, ' for'), 'direct', 'message', 'delivery?'], 'inside'),
);

printSVG(...elements);
