import { DiagonalLine, LineProps } from '../../typescript/svg/elements/line';
import { printSVG } from '../../typescript/svg/elements/svg';

import { A, A1, B, B2, C, links, nodes, relays } from './network-topology-mesh';

links.splice(7, 1);
links.splice(4, 1);
links.splice(2, 1);
links.splice(0, 1);

const props: Pick<LineProps, 'color'> = { color: 'orange' };

const route = [
    DiagonalLine(B2, C, props),
    DiagonalLine(C, B, props),
    DiagonalLine(B, A, props),
    DiagonalLine(A, A1, props),
];

const packets = route.map((line, index) => line.text('■', index === 1 ? 'left' : 'right', 18, { horizontalAlignment: 'center', verticalAlignment: 'center' }));

printSVG(...links, ...route, ...packets, ...nodes, ...relays);
