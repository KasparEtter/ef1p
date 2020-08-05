import { P, zeroPoint } from '../../typescript/svg/utility/point';

import { Circle } from '../../typescript/svg/elements/circle';
import { DiagonalLine } from '../../typescript/svg/elements/line';
import { printSVG } from '../../typescript/svg/elements/svg';

import { linkProperties, nodeProperties, nodeRadius } from './network-topology';

const node1 = new Circle({ center: zeroPoint, ...nodeProperties });
const node2 = new Circle({ center: P(8 * nodeRadius, 0), ...nodeProperties });
const link = DiagonalLine(node1, node2, linkProperties);
printSVG(link, node1, node2);
