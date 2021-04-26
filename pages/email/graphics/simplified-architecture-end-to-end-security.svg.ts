import { replaceFirstInPlace } from '../../../code/utility/functions';

import { printSVG } from '../../../code/svg/elements/svg';

import { Arc } from '../../../code/svg/elements/arc';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { Text } from '../../../code/svg/elements/text';

import { elements, imapForStorageArc, imapForStorageText, incomingMailServerOfRecipientBox, incomingMailServerOfRecipientText, incomingMailServerOfSenderBox, incomingMailServerOfSenderText, mailClientOfRecipientBox, mailClientOfRecipientText, mailClientOfSenderBox, mailClientOfSenderText, outgoingMailServerOfSenderBox, outgoingMailServerOfSenderText } from './simplified-architecture';

replaceFirstInPlace(elements, imapForStorageArc, new Arc({ ...imapForStorageArc.props, color: undefined }));
replaceFirstInPlace(elements, imapForStorageText, new Text({ ...imapForStorageText.props, color: undefined }));

replaceFirstInPlace(elements, incomingMailServerOfSenderBox, new Rectangle({ ...incomingMailServerOfSenderBox.props, color: 'red' }));
replaceFirstInPlace(elements, incomingMailServerOfSenderText, new Text({ ...incomingMailServerOfSenderText.props, color: 'red' }));

replaceFirstInPlace(elements, outgoingMailServerOfSenderBox, new Rectangle({ ...outgoingMailServerOfSenderBox.props, color: 'red' }));
replaceFirstInPlace(elements, outgoingMailServerOfSenderText, new Text({ ...outgoingMailServerOfSenderText.props, color: 'red' }));

replaceFirstInPlace(elements, incomingMailServerOfRecipientBox, new Rectangle({ ...incomingMailServerOfRecipientBox.props, color: 'red' }));
replaceFirstInPlace(elements, incomingMailServerOfRecipientText, new Text({ ...incomingMailServerOfRecipientText.props, color: 'red' }));

replaceFirstInPlace(elements, mailClientOfSenderBox, new Rectangle({ ...mailClientOfSenderBox.props, color: 'green' }));
replaceFirstInPlace(elements, mailClientOfSenderText, new Text({ ...mailClientOfSenderText.props, color: 'green' }));

replaceFirstInPlace(elements, mailClientOfRecipientBox, new Rectangle({ ...mailClientOfRecipientBox.props, color: 'green' }));
replaceFirstInPlace(elements, mailClientOfRecipientText, new Text({ ...mailClientOfRecipientText.props, color: 'green' }));

printSVG(...elements);
