import { inject } from '../../code/react/utility';

import { toolLookupDnsRecords } from '../../code/tools/lookups/dns-records';
import { toolLookupIpAddress } from '../../code/tools/lookups/ip-address';
import { toolLookupZoneDomains } from '../../code/tools/lookups/zone-domains';
import { toolProtocolHttp } from '../../code/tools/protocols/http';

// Internet
inject('tool-lookup-ip-address', toolLookupIpAddress);
inject('tool-protocol-http', toolProtocolHttp);
inject('tool-lookup-dns-records', toolLookupDnsRecords);
inject('tool-lookup-zone-domains', toolLookupZoneDomains);
