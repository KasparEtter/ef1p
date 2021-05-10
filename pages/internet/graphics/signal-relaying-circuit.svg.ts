/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Polyline } from '../../../code/svg/elements/polyline';
import { printSVG } from '../../../code/svg/elements/svg';

import { A, A1, B2, C, links, nodes, relays } from './network-topology-mesh';

links.splice(7, 1);
links.splice(3, 1);
links.splice(0, 1);

const route = Polyline.connectEllipses(
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
