import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { linkProperties } from './network-topology';
import { B2, linkPairs, nodes, relays } from './network-topology-mesh';

const links = linkPairs.map(pair => Line.connectEllipses(pair[0], pair[1], linkProperties));

printSVG(...links, ...nodes, ...relays, B2.text('*'));
