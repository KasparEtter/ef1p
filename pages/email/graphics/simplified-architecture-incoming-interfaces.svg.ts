/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { replaceFirstInPlace } from '../../../code/utility/functions';

import { printSVG } from '../../../code/svg/elements/svg';

import { Line } from '../../../code/svg/elements/line';
import { Text } from '../../../code/svg/elements/text';

import { elements, imapForRetrievalArrow, imapForRetrievalText, smtpForRelayArrow, smtpForRelayText } from './simplified-architecture';

replaceFirstInPlace(elements, smtpForRelayArrow, new Line({ ...smtpForRelayArrow.props, color: 'green' }));
replaceFirstInPlace(elements, smtpForRelayText, new Text({ ...smtpForRelayText.props, color: 'green' }));

replaceFirstInPlace(elements, imapForRetrievalArrow, new Line({ ...imapForRetrievalArrow.props, color: 'blue' }));
replaceFirstInPlace(elements, imapForRetrievalText, new Text({ ...imapForRetrievalText.props, color: 'blue' }));

printSVG(...elements);
