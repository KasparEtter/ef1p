/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { zeroPoint } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';

import { defaultDistance, nodeProperties } from './network-topology';

export const amount = 5;
const points = zeroPoint.radial(defaultDistance, amount, Math.PI / amount / 2 * 3);
export const nodes = points.map(point => new Circle({ center: point, ...nodeProperties }));
