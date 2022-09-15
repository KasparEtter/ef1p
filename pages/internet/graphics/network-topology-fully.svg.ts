/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { linkProperties } from './network-topology';
import { amount, nodes } from './network-topology-nodes';

const links = new Array<Line>();
for (let i = 0; i < amount; i++) {
    for (let j = i + 1; j < amount; j++) {
        links.push(Line.connectEllipses(nodes[i], nodes[j], linkProperties));
    }
}
printSVG(...links, ...nodes);
