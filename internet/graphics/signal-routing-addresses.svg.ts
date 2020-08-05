import { printSVG } from '../../typescript/svg/elements/svg';

import { linkLabels, links, nodeLabels, nodes, relayLabels, relays } from './network-topology-mesh';

printSVG(...links, ...nodes, ...relays, ...relayLabels, ...nodeLabels, ...linkLabels);
