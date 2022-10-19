/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { singleLineWithMarginHeight, textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const gap = singleLineWithMarginHeight * 1.5;

const elements = new Array<VisualElement>();

let x = 0;

const candidateText = bold('Candidate');
const candidateRectangle = new Rectangle({
    position: P(x, 0),
    size: estimateTextSizeWithMargin(candidateText),
    color: 'blue',
});
elements.push(candidateRectangle, candidateRectangle.text(candidateText));

x += candidateRectangle.props.size.x + gap;

const conditionText = bold('Condition');
const conditionRectangle = new Rectangle({
    position: P(x, 0),
    size: estimateTextSizeWithMargin(conditionText),
    color: 'orange',
});
elements.push(conditionRectangle, conditionRectangle.text(conditionText));

x += conditionRectangle.props.size.x + gap;

const liarText = bold('Liar');
const liarRectangle = new Rectangle({
    position: P(x, -singleLineWithMarginHeight),
    size: estimateTextSizeWithMargin(liarText),
    color: 'green',
});
elements.push(liarRectangle, liarRectangle.text(liarText));

const witnessText = bold('Witness');
const witnessRectangle = new Rectangle({
    position: P(x, singleLineWithMarginHeight),
    size: estimateTextSizeWithMargin(witnessText),
    color: 'red',
});
elements.push(witnessRectangle, witnessRectangle.text(witnessText));

elements.unshift(Line.connectBoxes(candidateRectangle, 'right', conditionRectangle, 'left'));
elements.unshift(...Line.connectBoxes(conditionRectangle, 'right', liarRectangle, 'left', { color: 'green' }).withText('true', 'left', textToLineDistance, {}, true));
elements.unshift(...Line.connectBoxes(conditionRectangle, 'right', witnessRectangle, 'left', { color: 'red' }).withText('false', 'right', textToLineDistance, {}, true));

printSVG(...elements);
