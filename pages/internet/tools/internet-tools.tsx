/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { injectTool } from '../../../code/react/utility';

import { toolLookupDnsRecords } from '../../../code/tools/lookups/dns-records';
import { toolLookupIpAddress } from '../../../code/tools/lookups/ip-address';
import { toolLookupZoneDomains } from '../../../code/tools/lookups/zone-domains';
import { toolProtocolHttp } from '../../../code/tools/protocols/http';

injectTool('tool-lookup-ip-address', toolLookupIpAddress);
injectTool('tool-lookup-dns-records', toolLookupDnsRecords);
injectTool('tool-lookup-zone-domains', toolLookupZoneDomains);
injectTool('tool-protocol-http', toolProtocolHttp);
