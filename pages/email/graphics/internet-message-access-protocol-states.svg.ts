/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, code, estimateTextSizeWithMargin} from '../../../code/svg/elements/text';

const notAuthenticatedText = bold('Not authenticated');
const authenticatedText = bold('Authenticated');
const selectedText = bold('Selected');
const logoutText = bold('Logout');

const gap = 105;
const color = 'pink';

const elements = new Array<VisualElement>();

const notAuthenticatedSize = estimateTextSizeWithMargin(notAuthenticatedText);
const notAuthenticatedRectangle = new Rectangle({ position: P(-notAuthenticatedSize.x / 2, 0), size: notAuthenticatedSize });
elements.push(...notAuthenticatedRectangle.withText(notAuthenticatedText));

const authenticatedSize = estimateTextSizeWithMargin(authenticatedText);
const authenticatedRectangle = new Rectangle({ position: P(-authenticatedSize.x / 2, gap), size: authenticatedSize });
elements.push(...authenticatedRectangle.withText(authenticatedText));

const selectedSize = estimateTextSizeWithMargin(selectedText);
const selectedRectangle = new Rectangle({ position: P(-selectedSize.x / 2, 2 * gap), size: selectedSize });
elements.push(...selectedRectangle.withText(selectedText));

const logoutSize = estimateTextSizeWithMargin(logoutText);
const logoutRectangle = new Rectangle({ position: P(-logoutSize.x / 2, 3 * gap), size: logoutSize });
elements.push(...logoutRectangle.withText(logoutText));

elements.unshift(...Line.connectBoxes(notAuthenticatedRectangle, 'bottom', authenticatedRectangle, 'top', { color }).moveRight().withText(['LOGIN', '  AUTHENTICATE'].map(code), 'right')); // The leading spaces make the graphic symmetric.
elements.unshift(...Line.connectBoxes(authenticatedRectangle, 'top', notAuthenticatedRectangle, 'bottom', { color }).moveRight().withText(['UNAUTHENTICATE'].map(code), 'right'));
elements.unshift(...Line.connectBoxes(authenticatedRectangle, 'bottom', selectedRectangle, 'top', { color }).moveRight().withText(['SELECT', 'EXAMINE'].map(code), 'right'));
elements.unshift(...Line.connectBoxes(selectedRectangle, 'top', authenticatedRectangle, 'bottom', { color }).moveRight().withText(['CLOSE', 'UNSELECT'].map(code), 'right'));
elements.unshift(...Line.connectBoxes(selectedRectangle, 'bottom', logoutRectangle, 'top', { color }).withText(['LOGOUT'].map(code), 'right'));

printSVG(...elements);
