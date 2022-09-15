/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P, zeroPoint } from '../../../code/svg/utility/point';

import { Arc } from '../../../code/svg/elements/arc';
import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { bold, estimateTextSizeWithMargin, T, uppercase } from '../../../code/svg/elements/text';

export const gap = 25;
export const distance = 125;
export const size = estimateTextSizeWithMargin(['Incoming', 'mail server', 'of recipient'].map(bold));

// https://github.com/gettalong/kramdown/issues/671
export const SMTP = uppercase('smtp');
export const IMAP = uppercase('imap');
export const POP3 = uppercase('pop3');

export const elements = new Array<VisualElement>();

export const mailClientOfSenderBox = new Rectangle({ position: P(0, size.y + distance), size });
export const mailClientOfSenderText = mailClientOfSenderBox.text([bold('Mail client'), 'of sender']);
elements.push(mailClientOfSenderBox, mailClientOfSenderText);

export const outgoingMailServerOfSenderBox = new Rectangle({ position: zeroPoint, size });
export const outgoingMailServerOfSenderText = outgoingMailServerOfSenderBox.text([bold('Outgoing'), bold('mail server'), 'of sender']);
elements.push(outgoingMailServerOfSenderBox, outgoingMailServerOfSenderText);

export const smtpForSubmissionArrow = Line.connectBoxes(mailClientOfSenderBox, 'top', outgoingMailServerOfSenderBox, 'bottom');
export const smtpForSubmissionText = smtpForSubmissionArrow.text([T(SMTP, ' for'), 'message', 'submission']);
elements.unshift(smtpForSubmissionArrow, smtpForSubmissionText);

export const incomingMailServerOfRecipientBox = new Rectangle({ position: P(size.x + distance, 0), size });
export const incomingMailServerOfRecipientText = incomingMailServerOfRecipientBox.text([bold('Incoming'), bold('mail server'), 'of recipient']);
elements.push(incomingMailServerOfRecipientBox, incomingMailServerOfRecipientText);

export const smtpForRelayArrow = Line.connectBoxes(outgoingMailServerOfSenderBox, 'right', incomingMailServerOfRecipientBox, 'left');
export const smtpForRelayText = smtpForRelayArrow.text([T(SMTP, ' for'), 'message relay']);
elements.unshift(smtpForRelayArrow, smtpForRelayText);

export const mailClientOfRecipientBox = new Rectangle({ position: P(size.x + distance, size.y + distance), size });
export const mailClientOfRecipientText = mailClientOfRecipientBox.text([bold('Mail client'), 'of recipient']);
elements.push(mailClientOfRecipientBox, mailClientOfRecipientText);

export const imapForRetrievalArrow = Line.connectBoxes(mailClientOfRecipientBox, 'top', incomingMailServerOfRecipientBox, 'bottom');
export const imapForRetrievalText = imapForRetrievalArrow.text([T(IMAP, ' or ', POP3), 'for message', 'retrieval'], 'right');
elements.unshift(imapForRetrievalArrow, imapForRetrievalText);

export const incomingMailServerOfSenderBox = new Rectangle({ position: P(-gap - size.x, 0), size, color: 'gray' });
export const incomingMailServerOfSenderText = incomingMailServerOfSenderBox.text([bold('Incoming'), bold('mail server'), 'of sender']);
elements.push(incomingMailServerOfSenderBox, incomingMailServerOfSenderText);

export const imapForStorageArc = Arc.connectBoxes(mailClientOfSenderBox, 'left', incomingMailServerOfSenderBox, 'bottom', { color: 'gray' });
export const imapForStorageText = imapForStorageArc.text([T(IMAP, ' for'), 'message', 'storage'], 'outside');
elements.unshift(imapForStorageArc, imapForStorageText);

export const outgoingMailServerOfRecipientBox = new Rectangle({ position: P(2 * size.x + distance + gap, 0), size, color: 'gray' });
export const outgoingMailServerOfRecipientText = outgoingMailServerOfRecipientBox.text([bold('Outgoing'), bold('mail server'), 'of recipient']);
elements.push(outgoingMailServerOfRecipientBox, outgoingMailServerOfRecipientText);
