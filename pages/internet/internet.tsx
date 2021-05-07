import { CodeBlock, SystemReply } from '../../code/react/code';
import { StaticPrompt } from '../../code/react/prompt';
import { inject } from '../../code/react/utility';

import { bindDnsQueries, toolLookupDnsRecords } from '../../code/tools/lookups/dns-records';
import { toolLookupIpAddress } from '../../code/tools/lookups/ip-address';
import { bindZoneWalks, toolLookupZoneDomains } from '../../code/tools/lookups/zone-domains';
import { toolProtocolHttp } from '../../code/tools/protocols/http';

inject('tool-lookup-ip-address', toolLookupIpAddress);
inject('tool-protocol-http', toolProtocolHttp);
inject('tool-lookup-dns-records', toolLookupDnsRecords);
inject('tool-lookup-zone-domains', toolLookupZoneDomains);

bindDnsQueries();
bindZoneWalks();

inject('code-ping-example', <CodeBlock>
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
