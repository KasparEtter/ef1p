import { DiagonalLine } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';

import { linkLabels, linkPairs, links, nodeLabels, nodes, relayLabels, relays } from './network-topology-mesh';

const affectedLink = 3;
links[affectedLink] = DiagonalLine(linkPairs[affectedLink][0], linkPairs[affectedLink][1], { color: 'red', marker: [] });

printSVG(...links, ...links[affectedLink].cross(), ...nodes, ...relays, ...relayLabels, ...nodeLabels, ...linkLabels.slice(0, 3));
