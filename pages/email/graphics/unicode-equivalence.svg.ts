/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { defaultCornerRadius, doubleStrokeWidth, doubleStrokeWidthMargin } from '../../../code/svg/utility/constants';
import { P, zeroPoint } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(['Compatibility', 'equivalence'].map(bold));

const elements = new Array<VisualElement>();

const innerRectangle = new Rectangle({ position: zeroPoint, size, color: 'blue' });
const outerRectangle = Rectangle.fromBox(innerRectangle.boundingBox().scaleX(2).addMargin(doubleStrokeWidthMargin), { color: 'green', cornerRadius: defaultCornerRadius + doubleStrokeWidth });

elements.push(innerRectangle, innerRectangle.text(['Canonical', 'equivalence'].map(bold)));
elements.push(outerRectangle, outerRectangle.text(['Compatibility', 'equivalence'].map(bold)).move(P((size.x + doubleStrokeWidth) / 2, 0)));

printSVG(...elements);
