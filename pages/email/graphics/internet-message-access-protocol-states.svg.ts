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
elements.push(notAuthenticatedRectangle, notAuthenticatedRectangle.text(notAuthenticatedText));

const authenticatedSize = estimateTextSizeWithMargin(authenticatedText);
const authenticatedRectangle = new Rectangle({ position: P(-authenticatedSize.x / 2, gap), size: authenticatedSize });
elements.push(authenticatedRectangle, authenticatedRectangle.text(authenticatedText));

const selectedSize = estimateTextSizeWithMargin(selectedText);
const selectedRectangle = new Rectangle({ position: P(-selectedSize.x / 2, 2 * gap), size: selectedSize });
elements.push(selectedRectangle, selectedRectangle.text(selectedText));

const logoutSize = estimateTextSizeWithMargin(logoutText);
const logoutRectangle = new Rectangle({ position: P(-logoutSize.x / 2, 3 * gap), size: logoutSize });
elements.push(logoutRectangle, logoutRectangle.text(logoutText));

const line1 = Line.connectBoxes(notAuthenticatedRectangle, 'bottom', authenticatedRectangle, 'top', { color }).moveRight();
elements.unshift(line1, line1.text(['LOGIN', '  AUTHENTICATE'].map(code), 'right')); // The leading spaces make the graphic symmetric.

const line2 = Line.connectBoxes(authenticatedRectangle, 'top', notAuthenticatedRectangle, 'bottom', { color }).moveRight();
elements.unshift(line2, line2.text(['UNAUTHENTICATE'].map(code), 'right'));

const line3 = Line.connectBoxes(authenticatedRectangle, 'bottom', selectedRectangle, 'top', { color }).moveRight();
elements.unshift(line3, line3.text(['SELECT', 'EXAMINE'].map(code), 'right'));

const line4 = Line.connectBoxes(selectedRectangle, 'top', authenticatedRectangle, 'bottom', { color }).moveRight();
elements.unshift(line4, line4.text(['CLOSE', 'UNSELECT'].map(code), 'right'));

const line5 = Line.connectBoxes(selectedRectangle, 'bottom', logoutRectangle, 'top', { color });
elements.unshift(line5, line5.text(['LOGOUT'].map(code), 'right'));

printSVG(...elements);
