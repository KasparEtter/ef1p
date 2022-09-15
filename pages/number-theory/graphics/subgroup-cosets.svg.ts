/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { singleLineWithMarginHeight, strokeWidth, strokeWidthMargin } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold } from '../../../code/svg/elements/text';

const width = singleLineWithMarginHeight * 3;
const size = P(width, singleLineWithMarginHeight);
const cornerRadius = 0;
const color = 'blue';
const classes = 'angular';

const elements = new Array<VisualElement>();

const rectangle1 = new Rectangle({ position: P(0, 0), size, cornerRadius, color, classes });
elements.push(...rectangle1.withText(bold('ℍ')));

const rectangle2 = new Rectangle({ position: P(0, singleLineWithMarginHeight), size, cornerRadius, color, classes });
elements.push(...rectangle2.withText(bold('ℍ ∘ A')));

const rectangle3 = new Rectangle({ position: P(0, 2 * singleLineWithMarginHeight), size, cornerRadius, color, classes });
elements.push(...rectangle3.withText(bold('ℍ ∘ B')));

const rectangle4 = new Rectangle({ position: P(0, 3 * singleLineWithMarginHeight), size, cornerRadius, color, classes });
elements.push(...rectangle4.withText(bold('⋮')));

const rectangle5 = new Rectangle({ position: P(0, -singleLineWithMarginHeight), size, color: 'green' });
elements.push(rectangle5.text('𝔾', { ignoreForClipping: false }));

const rectangle = new Rectangle({ position: P(-strokeWidth, -strokeWidth), size: P(width, 4 * singleLineWithMarginHeight).add(strokeWidthMargin.multiply(2)), cornerRadius, color: 'green', classes });
elements.push(rectangle);

printSVG(...elements);
