import { zeroPoint } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { DiagonalLine } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { linkProperties, relayProperties } from './network-topology';
import { amount, nodes } from './network-topology-nodes';

const center = new Circle({ center: zeroPoint, ...relayProperties })

const links = new Array();
for (let i = 0; i < amount; i++) {
    links.push(DiagonalLine(nodes[i], center, linkProperties));
}

printSVG(...links, ...nodes, center);
