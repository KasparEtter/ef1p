/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { elements, imapForRetrievalArrow, imapForStorageArc, incomingMailServerOfRecipientBox, incomingMailServerOfSenderBox, mailClientOfRecipientBox, mailClientOfSenderBox, outgoingMailServerOfSenderBox, smtpForRelayArrow, smtpForSubmissionArrow } from './simplified-architecture';

elements.splice(elements.indexOf(smtpForSubmissionArrow), 2);
elements.splice(elements.indexOf(smtpForRelayArrow), 2);
elements.splice(elements.indexOf(imapForRetrievalArrow), 2);
elements.splice(elements.indexOf(imapForStorageArc), 2);

elements.unshift(...Line.connectBoxes(outgoingMailServerOfSenderBox, 'bottom', mailClientOfSenderBox, 'top', { color: 'green' }).withText(['User', 'authen-', 'tication'], 'right'));
elements.unshift(...Line.connectBoxes(incomingMailServerOfRecipientBox, 'left', outgoingMailServerOfSenderBox, 'right', { color: 'green' }).withText(['Domain', 'authentication'], 'right'));
elements.unshift(...Line.connectBoxes(incomingMailServerOfRecipientBox, 'bottom', mailClientOfRecipientBox, 'top').withText(['User', 'authen-', 'tication'], 'left'));
elements.unshift(...Arc.connectBoxes(incomingMailServerOfSenderBox, 'bottom', mailClientOfSenderBox, 'left', { color: 'gray', ratio: 0.8 }).withText(['User', 'authen-', 'tication'], 'outside'));

printSVG(...elements);
