/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { P, zeroPoint } from '../../../code/svg/utility/point';

import { Arc } from '../../../code/svg/elements/arc';
import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';

const gap = 20;
const distance = 80;
const size = P(40, 40);

const smtp: Color = 'green';
const imap: Color = 'blue';

const elements = new Array<VisualElement>();

const mailClientOfSenderBox = new Rectangle({ position: P(0, size.y + distance), size });
elements.push(mailClientOfSenderBox);

const outgoingMailServerOfSenderBox = new Rectangle({ position: zeroPoint, size });
elements.push(outgoingMailServerOfSenderBox);

const smtpForSubmissionArrow = Line.connectBoxes(mailClientOfSenderBox, 'top', outgoingMailServerOfSenderBox, 'bottom', { color: smtp });
elements.unshift(smtpForSubmissionArrow);

const incomingMailServerOfRecipientBox = new Rectangle({ position: P(size.x + distance, 0), size });
elements.push(incomingMailServerOfRecipientBox);

const smtpForRelayArrow = Line.connectBoxes(outgoingMailServerOfSenderBox, 'right', incomingMailServerOfRecipientBox, 'left', { color: smtp });
elements.unshift(smtpForRelayArrow);

const mailClientOfRecipientBox = new Rectangle({ position: P(size.x + distance, size.y + distance), size });
elements.push(mailClientOfRecipientBox);

const imapForRetrievalArrow = Line.connectBoxes(mailClientOfRecipientBox, 'top', incomingMailServerOfRecipientBox, 'bottom', { color: imap });
elements.unshift(imapForRetrievalArrow);

const incomingMailServerOfSenderBox = new Rectangle({ position: P(-gap - size.x, 0), size });
elements.push(incomingMailServerOfSenderBox);

const imapForStorageArc = Arc.connectBoxes(mailClientOfSenderBox, 'left', incomingMailServerOfSenderBox, 'bottom', { color: imap });
elements.unshift(imapForStorageArc);

const outgoingMailServerOfRecipientBox = new Rectangle({ position: P(2 * size.x + distance + gap, 0), size, color: 'gray' });
elements.push(outgoingMailServerOfRecipientBox);

printSVG(...elements);
