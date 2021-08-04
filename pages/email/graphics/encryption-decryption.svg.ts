/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { textMargin, textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, estimateTextWidthWithMargin, Text } from '../../../code/svg/elements/text';

const encryptionText = bold('Encryption');
const decryptionText = bold('Decryption');

const aliceText = bold('Alice');
const bobText = bold('Bob');
const eveText = bold('Eve');

const plaintextText = 'Plaintext';
const ciphertextText = 'Ciphertext';
const keyText = 'Key';

const size = estimateTextSizeWithMargin(decryptionText);

const horizontalGap = estimateTextWidthWithMargin(ciphertextText, 3);
const verticalGap = size.y;

const elements = new Array<VisualElement>();

const marker = 'end';

const encryptionRectangle = new Rectangle({ position: P(horizontalGap, -size.y / 2), size, color: 'blue' });
elements.push(...encryptionRectangle.withText(encryptionText));

const decryptionRectangle = new Rectangle({ position: P(2 * horizontalGap + size.x, -size.y / 2), size, color: 'blue' });
elements.push(...decryptionRectangle.withText(decryptionText));

const leftPlaintextLine = new Line({
    start: P(0, 0),
    end: encryptionRectangle.boundingBox().pointAt('left'),
    marker,
    color: 'green',
});
elements.unshift(...leftPlaintextLine.withText(plaintextText));

const ciphertextLine = Line.connectBoxes(encryptionRectangle, 'right', decryptionRectangle, 'left', { color: 'red' });
elements.unshift(...ciphertextLine.withText(ciphertextText));

const rightPlaintextLine = new Line({
    start: decryptionRectangle.boundingBox().pointAt('right'),
    end: P(3 * horizontalGap + 2 * size.x, 0),
    marker,
    color: 'green',
});
elements.unshift(...rightPlaintextLine.withText(plaintextText));

function addKeyLine(rectangle: Rectangle): void {
    const end = rectangle.boundingBox().pointAt('top');
    const start = P(end.x, end.y - verticalGap);
    elements.unshift(new Line({ start, end, marker, color: 'green' }));
    elements.unshift(new Text({
        position: start.subtractY(textMargin.y),
        text: keyText,
        horizontalAlignment: 'middle',
        verticalAlignment: 'bottom',
        color: 'green',
    }));
}

addKeyLine(encryptionRectangle);
addKeyLine(decryptionRectangle);

elements.push(new Text({
    position: P(horizontalGap, -size.y / 2 - verticalGap),
    text: aliceText,
    horizontalAlignment: 'middle',
    verticalAlignment: 'top',
    color: 'green',
}));

elements.push(new Text({
    position: P(2 * horizontalGap + 2 * size.x, -size.y / 2 - verticalGap),
    text: bobText,
    horizontalAlignment: 'middle',
    verticalAlignment: 'top',
    color: 'green',
}));

elements.push(ciphertextLine.text(eveText, 'right', 2 * textToLineDistance, { color: 'red' }));

printSVG(...elements);
