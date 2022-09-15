/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { printSVG } from '../../../code/svg/elements/svg';

import { radius } from './set';

const elements = new Array<VisualElement>();

const circleA = new Circle({ center: P(0, 0), radius });
elements.push(...circleA.withText('𝔸'));

const circleB = new Circle({ center: P(2.4 * radius, 0), radius });
elements.push(...circleB.withText('𝔹'));

printSVG(...elements);
