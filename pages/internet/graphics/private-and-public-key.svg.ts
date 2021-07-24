/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P, zeroPoint } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, estimateTextWidthWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(bold('Private key'));

const elements = new Array<VisualElement>();

const privateKeyRectangle = new Rectangle({ position: zeroPoint, size });
elements.push(...privateKeyRectangle.withText(bold('Private key')));

const publicKeyRectangle = new Rectangle({ position: P(size.x + estimateTextWidthWithMargin('Infeasible', 3), 0), size });
elements.push(...publicKeyRectangle.withText(bold('Public key')));

elements.unshift(...Line.connectBoxes(privateKeyRectangle, 'right', publicKeyRectangle, 'left', { color: 'green' }).moveLeft().withText('Efficient'));
elements.unshift(...Line.connectBoxes(publicKeyRectangle, 'left', privateKeyRectangle, 'right', { color: 'red' }).moveLeft().withText('Infeasible'));

printSVG(...elements);
