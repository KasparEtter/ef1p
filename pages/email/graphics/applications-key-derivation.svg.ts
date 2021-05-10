/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, small, uppercase } from '../../../code/svg/elements/text';

const passwordText = bold('Password');
const keyText = bold('Cryptographic key');
const lineText = uppercase('pbkdf');
const circleText = ['Repeated', 'hashing'].map(small);

const elements = new Array<VisualElement>();

const passwordRectangleSize = estimateTextSizeWithMargin(passwordText);
const passwordRectangle = new Rectangle({ position: P(0, 0), size: passwordRectangleSize });
elements.push(passwordRectangle, passwordRectangle.text(passwordText));

const radius = estimateTextSizeWithMargin(circleText).x / 2;
const keyRectangle = new Rectangle({ position: P(passwordRectangleSize.x + 3 * radius, 0), size: estimateTextSizeWithMargin(keyText) });
elements.push(keyRectangle, keyRectangle.text(keyText));

const line = Line.connectBoxes(passwordRectangle, 'right', keyRectangle, 'left', { color: 'blue' });
elements.unshift(line, line.text(lineText));

const circle = new Circle({ center: line.center().addY(radius), radius, color: 'blue' });
elements.unshift(circle, circle.text(circleText));

printSVG(...elements);
