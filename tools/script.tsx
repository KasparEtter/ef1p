import { inject } from '../typescript/react/utility';

import { dnsWidget } from '../typescript/widgets/dns/widget';
import { ipWidget } from '../typescript/widgets/ip/widget';
import { zoneWidget } from '../typescript/widgets/zone/widget';

inject('tool-ip-info', ipWidget);
inject('tool-dns-resolver', dnsWidget);
inject('tool-zone-walker', zoneWidget);
