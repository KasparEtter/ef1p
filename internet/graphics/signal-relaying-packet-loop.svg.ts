import { DiagonalLine, LineProps } from '../../typescript/svg/elements/line';
import { printSVG } from '../../typescript/svg/elements/svg';

import { A, A1, B, C, links, nodes, relays } from './network-topology-mesh';

links.splice(4, 1);
links.splice(3, 1);
links.splice(2, 1);
links.splice(0, 1);

const props: Pick<LineProps, 'color'> = { color: 'orange' };

const route = [
    DiagonalLine(A1, A, props),
    DiagonalLine(A, B, props),
    DiagonalLine(B, C, props),
    DiagonalLine(C, A, props),
];

const packets = route.map(line => line.text('■', 'left', 18, { horizontalAlignment: 'center', verticalAlignment: 'center' }));

printSVG(...links, ...route, ...packets, ...nodes, ...relays);
