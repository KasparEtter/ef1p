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
elements.push(inputRectangle, inputRectangle.text(inputText));

const outputText = [T(bold('Output'), ' of'), 'fixed size'];
const outputRectangle = new Rectangle({ position: P(size.x + estimateTextWidthWithMargin('Infeasible', 3), 0), size: estimateTextSizeWithMargin(outputText) });
elements.push(outputRectangle, outputRectangle.text(outputText));

const efficientLine = Line.connectBoxes(inputRectangle, 'right', outputRectangle, 'left', { color: 'green' }).moveLeft();
elements.unshift(efficientLine, efficientLine.text('Efficient'));

const infeasibleLine = Line.connectBoxes(outputRectangle, 'left', inputRectangle, 'right', { color: 'red' }).moveLeft();
elements.unshift(infeasibleLine, infeasibleLine.text('Infeasible'));

printSVG(...elements);
