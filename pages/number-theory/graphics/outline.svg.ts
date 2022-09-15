/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { doubleLineWithMarginHeight, singleLineWithMarginHeight } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextWidthWithMargin } from '../../../code/svg/elements/text';

const width = estimateTextWidthWithMargin('(Multiplicative notation)');
const gapX = singleLineWithMarginHeight;
const gapY = gapX;
const column = width + gapX;

const elements = new Array<VisualElement>();

let y = 0;

const linearOneWayFunctionsRectangle = new Rectangle({ position: P(column, y), size: P(column + width, singleLineWithMarginHeight) });
elements.push(...linearOneWayFunctionsRectangle.withText(bold('1. Linear one-way functions')));

y += singleLineWithMarginHeight + gapY;

const finiteGroupsRectangle = new Rectangle({ position: P(0, y), size: P(2 * column + width, singleLineWithMarginHeight) });
elements.push(...finiteGroupsRectangle.withText(bold('2. Finite groups')));

y += singleLineWithMarginHeight + gapY;

const additiveGroupsRectangle = new Rectangle({ position: P(0, y), size: P(width, doubleLineWithMarginHeight) });
elements.push(...additiveGroupsRectangle.withText([bold('4. Additive groups'), '(Additive notation)']));

const multiplicativeGroupsRectangle = new Rectangle({ position: P(column, y), size: P(width, doubleLineWithMarginHeight) });
elements.push(...multiplicativeGroupsRectangle.withText([bold('5. Multiplicative groups'), '(Multiplicative notation)']));

const ellipticCurvesRectangle = new Rectangle({ position: P(2 * column, y), size: P(width, doubleLineWithMarginHeight) });
elements.push(...ellipticCurvesRectangle.withText([bold('9. Elliptic curves'), '(Additive notation)']));

y += doubleLineWithMarginHeight + gapY;

const modularArithmeticRectangle = new Rectangle({ position: P(0, y), size: P(width, singleLineWithMarginHeight) });
elements.push(...modularArithmeticRectangle.withText(bold('3. Modular arithmetic')));

const primeNumbersRectangle = new Rectangle({ position: P(column, y), size: P(width, singleLineWithMarginHeight) });
elements.push(...primeNumbersRectangle.withText(bold('6. Prime numbers')));

const finiteFieldsRectangle = new Rectangle({ position: P(2 * column, y), size: P(width, singleLineWithMarginHeight) });
elements.push(...finiteFieldsRectangle.withText(bold('8. Finite fields')));

y += singleLineWithMarginHeight + gapY;

const commutativeRingsRectangle = new Rectangle({ position: P(2 * column, y), size: P(width, singleLineWithMarginHeight) });
elements.push(...commutativeRingsRectangle.withText(bold('7. Commutative rings')));

elements.unshift(Line.connectBoxes(commutativeRingsRectangle, 'top', finiteFieldsRectangle, 'bottom'));
elements.unshift(Line.connectBoxes(modularArithmeticRectangle, 'top', additiveGroupsRectangle, 'bottom'));
elements.unshift(Line.connectBoxes(modularArithmeticRectangle, 'right', primeNumbersRectangle, 'left'));
elements.unshift(Line.connectBoxes(primeNumbersRectangle, 'top', multiplicativeGroupsRectangle, 'bottom'));
elements.unshift(Line.connectBoxes(primeNumbersRectangle, 'right', finiteFieldsRectangle, 'left'));
elements.unshift(Line.connectBoxes(finiteFieldsRectangle, 'top', ellipticCurvesRectangle, 'bottom'));
elements.unshift(Line.connectBoxes(additiveGroupsRectangle, 'top', finiteGroupsRectangle, 'bottom', {}, (start, end) => [start, P(start.x, end.y)]));
elements.unshift(Line.connectBoxes(multiplicativeGroupsRectangle, 'top', finiteGroupsRectangle, 'bottom', {}, (start, end) => [start, P(start.x, end.y)]));
elements.unshift(Line.connectBoxes(ellipticCurvesRectangle, 'top', finiteGroupsRectangle, 'bottom', {}, (start, end) => [start, P(start.x, end.y)]));
elements.unshift(Line.connectBoxes(finiteGroupsRectangle, 'top', linearOneWayFunctionsRectangle, 'bottom', {}, (start, end) => [P(column + width / 2, start.y), P(column + width / 2, end.y)]));
elements.unshift(Line.connectBoxes(finiteGroupsRectangle, 'top', linearOneWayFunctionsRectangle, 'bottom', {}, (start, end) => [P(2 * column + width / 2, start.y), P(2 * column + width / 2, end.y)]));

printSVG(...elements);
