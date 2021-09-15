/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { replaceFirstInPlace } from '../../../code/utility/array';

import { printSVG } from '../../../code/svg/elements/svg';

import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { Text } from '../../../code/svg/elements/text';

import { elements, imapForRetrievalArrow, imapForRetrievalText, imapForStorageArc, imapForStorageText, incomingMailServerOfRecipientBox, incomingMailServerOfRecipientText, incomingMailServerOfSenderBox, incomingMailServerOfSenderText, mailClientOfRecipientBox, mailClientOfRecipientText, smtpForRelayArrow, smtpForRelayText, smtpForSubmissionArrow, smtpForSubmissionText } from './simplified-architecture';

replaceFirstInPlace(elements, smtpForSubmissionArrow, new Line({ ...smtpForSubmissionArrow.props, color: 'green' }));
replaceFirstInPlace(elements, smtpForSubmissionText, new Text({ ...smtpForSubmissionText.props, color: 'green' }));

replaceFirstInPlace(elements, imapForStorageArc, new Arc({ ...imapForStorageArc.props, color: 'blue' }));
replaceFirstInPlace(elements, imapForStorageText, new Text({ ...imapForStorageText.props, color: 'blue' }));

replaceFirstInPlace(elements, incomingMailServerOfSenderBox, new Rectangle({ ...incomingMailServerOfSenderBox.props, color: undefined }));
replaceFirstInPlace(elements, incomingMailServerOfSenderText, new Text({ ...incomingMailServerOfSenderText.props, color: undefined }));

replaceFirstInPlace(elements, incomingMailServerOfRecipientBox, new Rectangle({ ...incomingMailServerOfRecipientBox.props, color: 'gray' }));
replaceFirstInPlace(elements, incomingMailServerOfRecipientText, new Text({ ...incomingMailServerOfRecipientText.props, color: 'gray' }));

replaceFirstInPlace(elements, mailClientOfRecipientBox, new Rectangle({ ...mailClientOfRecipientBox.props, color: 'gray' }));
replaceFirstInPlace(elements, mailClientOfRecipientText, new Text({ ...mailClientOfRecipientText.props, color: 'gray' }));

replaceFirstInPlace(elements, smtpForRelayArrow, new Line({ ...smtpForRelayArrow.props, color: 'gray' }));
replaceFirstInPlace(elements, smtpForRelayText, new Text({ ...smtpForRelayText.props, color: 'gray' }));

replaceFirstInPlace(elements, imapForRetrievalArrow, new Line({ ...imapForRetrievalArrow.props, color: 'gray' }));
replaceFirstInPlace(elements, imapForRetrievalText, new Text({ ...imapForRetrievalText.props, color: 'gray' }));

printSVG(...elements);
