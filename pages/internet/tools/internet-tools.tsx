/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { inject } from '../../../code/react/utility';

import { toolLookupDnsRecords } from '../../../code/tools/lookups/dns-records';
import { toolLookupIpAddress } from '../../../code/tools/lookups/ip-address';
import { toolLookupZoneDomains } from '../../../code/tools/lookups/zone-domains';
import { toolProtocolHttp } from '../../../code/tools/protocols/http';

inject('tool-lookup-ip-address', toolLookupIpAddress);
inject('tool-lookup-dns-records', toolLookupDnsRecords);
inject('tool-lookup-zone-domains', toolLookupZoneDomains);

inject('tool-protocol-http', toolProtocolHttp);
