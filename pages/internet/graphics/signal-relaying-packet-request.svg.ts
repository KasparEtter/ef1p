/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Line, LineProps } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { A, A1, B2, C, links, nodes, relays } from './network-topology-mesh';

links.splice(7, 1);
links.splice(3, 1);
links.splice(0, 1);

const props: Pick<LineProps, 'color'> = { color: 'orange' };

const route = [
    Line.connectEllipses(A1, A, props),
    Line.connectEllipses(A, C, props),
    Line.connectEllipses(C, B2, props),
];

const packets = route.map(line => line.text('■', 'left', 18, { horizontalAlignment: 'middle', verticalAlignment: 'middle' }));

printSVG(...links, ...route, ...packets, ...nodes, ...relays);
