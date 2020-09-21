import { inject } from '../typescript/react/utility';

import { bindDnsQueries, dnsTool } from '../typescript/tools/dns/tool';
import { httpTool } from '../typescript/tools/http/tool';
import { ipTool } from '../typescript/tools/ip/tool';
import { bindZoneWalks, zoneTool } from '../typescript/tools/zone/tool';

inject('tool-ip-info', ipTool);
inject('tool-http-cli', httpTool);
inject('tool-dns-resolver', dnsTool);
inject('tool-zone-walker', zoneTool);

bindDnsQueries();
bindZoneWalks();
