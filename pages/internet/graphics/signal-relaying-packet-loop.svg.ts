/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Line, LineProps } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { A, A1, B, C, links, nodes, relays } from './network-topology-mesh';

links.splice(4, 1);
links.splice(3, 1);
links.splice(2, 1);
links.splice(0, 1);

const props: Pick<LineProps, 'color'> = { color: 'orange' };

const route = [
    Line.connectEllipses(A1, A, props),
    Line.connectEllipses(A, B, props),
    Line.connectEllipses(B, C, props),
    Line.connectEllipses(C, A, props),
];

const packets = route.map(line => line.text('■', 'left', 18, { horizontalAlignment: 'center', verticalAlignment: 'center' }));

printSVG(...links, ...route, ...packets, ...nodes, ...relays);
