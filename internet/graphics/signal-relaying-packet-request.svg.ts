import { DiagonalLine, LineProps } from '../../typescript/svg/elements/line';
import { printSVG } from '../../typescript/svg/elements/svg';

import { A, A1, B2, C, links, nodes, relays } from './network-topology-mesh';

links.splice(7, 1);
links.splice(3, 1);
links.splice(0, 1);

const props: Pick<LineProps, 'color'> = { color: 'orange' };

const route = [
    DiagonalLine(A1, A, props),
    DiagonalLine(A, C, props),
    DiagonalLine(C, B2, props),
];

const packets = route.map(line => line.text('■', 'left', 18, { horizontalAlignment: 'center', verticalAlignment: 'center' }));

printSVG(...links, ...route, ...packets, ...nodes, ...relays);
