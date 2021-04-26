import { defaultCornerRadius, strokeWidthMargin } from '../../../code/svg/utility/constants';
import { P, zeroPoint } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(['Compatibility', 'equivalence'].map(bold));
const margin = strokeWidthMargin.multiply(2);

const elements = new Array<VisualElement>();

const innerRectangle = new Rectangle({ position: zeroPoint, size, color: 'blue' });
const outerRectangle = Rectangle.fromBox(innerRectangle.boundingBox().scaleX(2).addMargin(margin), { color: 'green', cornerRadius: defaultCornerRadius + margin.x });

elements.push(innerRectangle, innerRectangle.text(['Canonical', 'equivalence'].map(bold)));
elements.push(outerRectangle, outerRectangle.text(['Compatibility', 'equivalence'].map(bold)).move(P((size.x + margin.x) / 2, 0)));

printSVG(...elements);
