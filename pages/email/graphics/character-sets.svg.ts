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
import { bold, estimateTextSizeWithMargin, uppercase } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin([bold('ISO-8859-1'), '8 bits']);
const vector = P(size.x + doubleStrokeWidth, 0);

const elements = new Array<VisualElement>();

const asciiRectangle = new Rectangle({ position: zeroPoint, size, color: 'brown' });
const isoRectangle = Rectangle.fromBox(asciiRectangle.boundingBox().scaleX(2).addMargin(doubleStrokeWidthMargin), { color: 'blue', cornerRadius: defaultCornerRadius + doubleStrokeWidth });
const utfRectangle = Rectangle.fromBox(asciiRectangle.boundingBox().scaleX(3).addMargin(doubleStrokeWidthMargin).addMargin(doubleStrokeWidthMargin), { color: 'green', cornerRadius: defaultCornerRadius + doubleStrokeWidth * 2 });

elements.push(asciiRectangle, asciiRectangle.text([bold(uppercase('ascii')), '7 bits']));
elements.push(isoRectangle, isoRectangle.text([bold(uppercase('iso-8859-1')), '8 bits']).move(vector.multiply(0.5)));
elements.push(utfRectangle, utfRectangle.text([bold(uppercase('utf-8')), '8 to 32 bits']).move(vector.multiply(1)));

printSVG(...elements);
