/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeRadius } from '../../../code/svg/utility/constants';
import { LineSide, P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin} from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(bold('Decrypt'));
const length = 2.3 * size.x;
const gap = 1.3 * size.y;
const extraGap = size.y;

const elements = new Array<VisualElement>();

const startRectangle = new Rectangle({ position: P(0, 0), size });

const signRectangle = new Rectangle({ position: P(0, 1 * (gap + size.y)), size, color: 'blue' });
elements.push(...signRectangle.withText(bold('Sign')));

const encryptRectangle = new Rectangle({ position: P(0, 2 * (gap + size.y)), size, color: 'blue' });
elements.push(...encryptRectangle.withText(bold('Encrypt')));

const decryptRectangle = new Rectangle({ position: P(0, 3 * (gap + size.y) + extraGap), size, color: 'green' });
elements.push(...decryptRectangle.withText(bold('Decrypt')));

const verifyRectangle = new Rectangle({ position: P(0, 4 * (gap + size.y) + extraGap), size, color: 'green' });
elements.push(...verifyRectangle.withText(bold('Verify')));

const endRectangle = new Rectangle({ position: P(0, 5 * (gap + size.y) + extraGap), size });

function addLine(rectangle: Rectangle, text: string, side: LineSide = 'left'): void {
    const end = rectangle.boundingBox().pointAt('left');
    const start = end.subtractX(length);
    elements.push(...new Line({ start, end, marker: 'end', startOffset: 7.5 * strokeRadius }).withText(text, side));
}

addLine(signRectangle, 'Private key of sender');
addLine(encryptRectangle, 'Public key of recipient', 'right');
addLine(decryptRectangle, 'Private key of recipient');
addLine(verifyRectangle, 'Public key of sender', 'right');

elements.unshift(...Line.connectBoxes(startRectangle, 'bottom', signRectangle, 'top').withText('Message'));

const senderLine = Line.connectBoxes(signRectangle, 'bottom', encryptRectangle, 'top');
elements.unshift(senderLine, senderLine.text('Signed message'), senderLine.text(bold('Sender'), 'right', size.x, { color: 'blue' }));

const attackerLine = Line.connectBoxes(encryptRectangle, 'bottom', decryptRectangle, 'top', { color: 'red' });
elements.unshift(attackerLine, attackerLine.text(['Signed and', 'encrypted', 'message']), attackerLine.text(bold('Attacker'), 'right', size.x));

const recipientLine = Line.connectBoxes(decryptRectangle, 'bottom', verifyRectangle, 'top');
elements.unshift(recipientLine, recipientLine.text('Signed message'), recipientLine.text(bold('Recipient'), 'right', size.x, { color: 'green' }));

elements.unshift(...Line.connectBoxes(verifyRectangle, 'bottom', endRectangle, 'top').withText('Message, status'));

printSVG(...elements);
