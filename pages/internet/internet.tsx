/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { CodeBlock, SystemReply } from '../../code/react/code';
import { injectElement, injectTool } from '../../code/react/injection';
import { StaticPrompt } from '../../code/react/prompt';

import { toolLookupDnsRecords } from '../../code/tools/lookup/dns-records';
import { toolLookupIpAddress } from '../../code/tools/lookup/ip-address';
import { toolLookupZoneDomains } from '../../code/tools/lookup/zone-domains';
import { toolProtocolHttp } from '../../code/tools/protocol/http';

injectTool('tool-lookup-ip-address', toolLookupIpAddress);
injectTool('tool-protocol-http', toolProtocolHttp);
injectTool('tool-lookup-dns-records', toolLookupDnsRecords);
injectTool('tool-lookup-zone-domains', toolLookupZoneDomains);

injectElement('code-ping-example', <CodeBlock>
    <StaticPrompt>ping -c 5 example.com</StaticPrompt>
    <SystemReply>PING example.com (93.184.216.34): 56 data bytes</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=0 ttl=50 time=87.363 ms</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=1 ttl=50 time=88.107 ms</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=2 ttl=50 time=87.196 ms</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=3 ttl=50 time=88.546 ms</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=4 ttl=50 time=87.811 ms</SystemReply><br/>
    <SystemReply>--- example.com ping statistics ---</SystemReply>
    <SystemReply>5 packets transmitted, 5 packets received, 0.0% packet loss</SystemReply>
    <SystemReply>round-trip min/avg/max/stddev = 87.196/87.805/88.546/0.491 ms</SystemReply>
</CodeBlock>);
