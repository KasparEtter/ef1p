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
elements.push(signRectangle, signRectangle.text(bold('Sign')));

const encryptRectangle = new Rectangle({ position: P(0, 2 * (gap + size.y)), size, color: 'blue' });
elements.push(encryptRectangle, encryptRectangle.text(bold('Encrypt')));

const decryptRectangle = new Rectangle({ position: P(0, 3 * (gap + size.y) + extraGap), size, color: 'green' });
elements.push(decryptRectangle, decryptRectangle.text(bold('Decrypt')));

const verifyRectangle = new Rectangle({ position: P(0, 4 * (gap + size.y) + extraGap), size, color: 'green' });
elements.push(verifyRectangle, verifyRectangle.text(bold('Verify')));

const endRectangle = new Rectangle({ position: P(0, 5 * (gap + size.y) + extraGap), size });

function addLine(rectangle: Rectangle, text: string, side: LineSide = 'left'): void {
    const end = rectangle.boundingBox().pointAt('left');
    const start = end.subtractX(length);
    const line = new Line({ start, end, marker: 'end', startOffset: 7.5 * strokeRadius });
    elements.push(line, line.text(text, side));
}

addLine(signRectangle, 'Private key of sender');
addLine(encryptRectangle, 'Public key of recipient', 'right');
addLine(decryptRectangle, 'Private key of recipient');
addLine(verifyRectangle, 'Public key of sender', 'right');

const line1 = Line.connectBoxes(startRectangle, 'bottom', signRectangle, 'top');
elements.unshift(line1, line1.text('Message'));

const line2 = Line.connectBoxes(signRectangle, 'bottom', encryptRectangle, 'top');
elements.unshift(line2, line2.text('Signed message'), line2.text(bold('Sender'), 'right', size.x, { color: 'blue' }));

const line3 = Line.connectBoxes(encryptRectangle, 'bottom', decryptRectangle, 'top', { color: 'red' });
elements.unshift(line3, line3.text(['Signed and', 'encrypted', 'message']), line3.text(bold('Attacker'), 'right', size.x));

const line4 = Line.connectBoxes(decryptRectangle, 'bottom', verifyRectangle, 'top');
elements.unshift(line4, line4.text('Signed message'), line4.text(bold('Recipient'), 'right', size.x, { color: 'green' }));

const line5 = Line.connectBoxes(verifyRectangle, 'bottom', endRectangle, 'top');
elements.unshift(line5, line5.text('Message, status'));

printSVG(...elements);
