import { DiagonalPolyline } from '../../typescript/svg/elements/polyline';
import { printSVG } from '../../typescript/svg/elements/svg';

import { A, A1, B2, C, links, nodes, relays } from './network-topology-mesh';

links.splice(7, 1);
links.splice(3, 1);
links.splice(0, 1);

const route = DiagonalPolyline(
    A1,
    B2,
    [
        A.center(),
        C.center(),
    ],
    {
        color: 'orange',
        marker: ['start', 'middle', 'end'],
    },
);

printSVG(...links, ...nodes, ...relays, route);
