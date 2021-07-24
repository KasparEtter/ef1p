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

const size = estimateTextSizeWithMargin(bold('Server'));

const elements = new Array<VisualElement>();

const clientRectangle = new Rectangle({ position: zeroPoint, size });
elements.push(...clientRectangle.withText(bold('Client')));

const serverRectangle = new Rectangle({ position: P(size.x + estimateTextWidthWithMargin('Response', 3), 0), size });
elements.push(...serverRectangle.withText(bold('Server')));

elements.unshift(...Line.connectBoxes(clientRectangle, 'right', serverRectangle, 'left', { color: 'blue' }).moveLeft().withText('Request'));
elements.unshift(...Line.connectBoxes(serverRectangle, 'left', clientRectangle, 'right', { color: 'green' }).moveLeft().withText('Response'));

printSVG(...elements);
