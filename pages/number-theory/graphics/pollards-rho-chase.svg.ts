/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { zeroPoint } from '../../../code/svg/utility/point';

import { Arc } from '../../../code/svg/elements/arc';
import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { elementRadius, getLabel, rhoRadius } from './pollards-rho';

const radius = elementRadius;

const elements = new Array<VisualElement>();

let index = 4;

let center = zeroPoint;
const circle0 = new Circle({ center, radius })
elements.push(...circle0.withText('…'));

center = center.addX(rhoRadius);
const circle1 = new Circle({ center, radius })
elements.push(...circle1.withText(getLabel(index++)));

center = center.addX(rhoRadius);
const circle2 = new Circle({ center, radius, color: 'red' })
elements.push(...circle2.withText(getLabel(index++)));

center = center.addX(rhoRadius);
const circle3 = new Circle({ center, radius, color: 'orange' })
elements.push(...circle3.withText(getLabel(index++)));

center = center.addX(rhoRadius);
const circle4 = new Circle({ center, radius, color: 'green' })
elements.push(...circle4.withText(getLabel(index++)));

center = center.addX(rhoRadius);
const circle5 = new Circle({ center, radius })
elements.push(...circle5.withText(getLabel(index++)));

center = center.addX(rhoRadius);
const circle6 = new Circle({ center, radius })
elements.push(...circle6.withText('…'));

elements.unshift(Line.connectEllipses(circle0, circle1));
elements.unshift(Line.connectEllipses(circle1, circle2));
elements.unshift(Line.connectEllipses(circle2, circle3));
elements.unshift(Line.connectEllipses(circle3, circle4));
elements.unshift(Line.connectEllipses(circle4, circle5));
elements.unshift(Line.connectEllipses(circle5, circle6));

elements.unshift(Arc.connectBoxes(circle2, 'top', circle4, 'top', { color: 'red' }));
elements.unshift(Arc.connectBoxes(circle3, 'top', circle4, 'top', { color: 'orange' }));

printSVG(...elements);
