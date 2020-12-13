import { P, zeroPoint } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { linkProperties, nodeProperties, nodeRadius } from './network-topology';

const node1 = new Circle({ center: zeroPoint, ...nodeProperties });
const node2 = new Circle({ center: P(8 * nodeRadius, 0), ...nodeProperties });
const link = Line.connectEllipses(node1, node2, linkProperties);
printSVG(link, node1, node2);
