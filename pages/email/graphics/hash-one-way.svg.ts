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
import { bold, estimateTextSizeWithMargin, estimateTextWidthWithMargin, T } from '../../../code/svg/elements/text';

const elements = new Array<VisualElement>();

const inputText = [T(bold('Input'), ' of'), 'any size'];
const size = estimateTextSizeWithMargin(inputText);
const inputRectangle = new Rectangle({ position: P(0, 0), size });
elements.push(...inputRectangle.withText(inputText));

const outputText = [T(bold('Output'), ' of'), 'fixed size'];
const outputRectangle = new Rectangle({ position: P(size.x + estimateTextWidthWithMargin('Infeasible', 3), 0), size: estimateTextSizeWithMargin(outputText) });
elements.push(...outputRectangle.withText(outputText));

elements.unshift(...Line.connectBoxes(inputRectangle, 'right', outputRectangle, 'left', { color: 'green' }).moveLeft().withText('Efficient'));
elements.unshift(...Line.connectBoxes(outputRectangle, 'left', inputRectangle, 'right', { color: 'red' }).moveLeft().withText('Infeasible'));

printSVG(...elements);
