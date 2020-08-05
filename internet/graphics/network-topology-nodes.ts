import { Circle } from '../../typescript/svg/elements/circle';
import { zeroPoint } from '../../typescript/svg/utility/point';

import { nodeProperties, nodeRadius } from './network-topology';

export const amount = 5;
const points = zeroPoint.radial(6 * nodeRadius, amount, Math.PI / amount / 2 * 3);
export const nodes = points.map(point => new Circle({ center: point, ...nodeProperties }));
