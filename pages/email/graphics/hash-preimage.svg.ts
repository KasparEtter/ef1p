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
import { bold, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(bold('Given output'));
const horizontalGap = size.y;

const elements = new Array<VisualElement>();

const inputRectangle = new Rectangle({ position: P(0, 0), size, color: 'green' });
elements.push(...inputRectangle.withText(bold('Find input')));

const outputRectangle = new Rectangle({ position: P(size.x + horizontalGap, 0), size, color: 'blue' });
elements.push(...outputRectangle.withText(bold('Given output')));

elements.unshift(Line.connectBoxes(inputRectangle, 'right', outputRectangle, 'left'));

printSVG(...elements);
