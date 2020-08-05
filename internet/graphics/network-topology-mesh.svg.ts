import { DiagonalLine } from '../../typescript/svg/elements/line';
import { printSVG } from '../../typescript/svg/elements/svg';

import { linkProperties } from './network-topology';
import { B2, linkPairs, nodes, relays } from './network-topology-mesh';

const links = linkPairs.map(pair => DiagonalLine(pair[0], pair[1], linkProperties));

printSVG(...links, ...nodes, ...relays, B2.text('*'));
