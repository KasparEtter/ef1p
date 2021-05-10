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

export const line1 = Line.connectBoxes(outgoingMailServerOfSenderBox, 'bottom', mailClientOfSenderBox, 'top', { color: 'green' });
elements.unshift(line1, line1.text(['User', 'authen-', 'tication'], 'right'));

export const line2 = Line.connectBoxes(incomingMailServerOfRecipientBox, 'left', outgoingMailServerOfSenderBox, 'right', { color: 'green' });
elements.unshift(line2, line2.text(['Domain', 'authentication'], 'right'));

export const line3 = Line.connectBoxes(incomingMailServerOfRecipientBox, 'bottom', mailClientOfRecipientBox, 'top');
elements.unshift(line3, line3.text(['User', 'authen-', 'tication'], 'left'));

export const arc1 = Arc.connectBoxes(incomingMailServerOfSenderBox, 'bottom', mailClientOfSenderBox, 'left', { color: 'gray' });
elements.unshift(arc1, arc1.text(['User', 'authen-', 'tication'], 'outside'));

printSVG(...elements);
