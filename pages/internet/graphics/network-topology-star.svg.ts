/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { zeroPoint } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { linkProperties, relayProperties } from './network-topology';
import { amount, nodes } from './network-topology-nodes';

const center = new Circle({ center: zeroPoint, ...relayProperties })

const links = new Array<Line>();
for (let i = 0; i < amount; i++) {
    links.push(Line.connectEllipses(nodes[i], center, linkProperties));
}

printSVG(...links, ...nodes, center);
