import { Arc } from '../../../code/svg/elements/arc';
import { printSVG } from '../../../code/svg/elements/svg';
import { T } from '../../../code/svg/elements/text';

import { elements, incomingMailServerOfRecipientBox, mailClientOfSenderBox, outgoingMailServerOfRecipientBox, outgoingMailServerOfSenderBox, SMTP } from './simplified-architecture';

elements.push(...outgoingMailServerOfSenderBox.cross(0, 'red'));
elements.push(...outgoingMailServerOfRecipientBox.cross(0, 'gray'));

const arc = Arc.connectBoxes(mailClientOfSenderBox, 'top', incomingMailServerOfRecipientBox, 'left', { color: 'red' });
elements.splice(elements.indexOf(mailClientOfSenderBox), 0, arc, arc.text([T(SMTP, ' for'), 'direct', 'message', 'delivery?'], 'inside'));

printSVG(...elements);
