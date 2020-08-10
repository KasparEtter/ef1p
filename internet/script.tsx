import { bind, inject } from '../typescript/react/utility';

import { dnsTool, setDnsResolverInputs } from '../typescript/tools/dns/tool';
import { httpTool } from '../typescript/tools/http/tool';
import { ipTool } from '../typescript/tools/ip/tool';
import { setZoneWalkerInputFields, zoneTool } from '../typescript/tools/zone/tool';

inject('tool-ip-info', ipTool);
inject('tool-http-cli', httpTool);
inject('tool-dns-resolver', dnsTool);
inject('tool-zone-walker', zoneTool);

bind('dns-query-example-a', 'onclick', () => setDnsResolverInputs('ef1p.com', 'A', false));
bind('dns-query-example-aaaa', 'onclick', () => setDnsResolverInputs('google.com', 'AAAA', false));
bind('dns-query-example-caa', 'onclick', () => setDnsResolverInputs('wikipedia.org', 'CAA', false));
bind('dns-query-example-cname', 'onclick', () => setDnsResolverInputs('www.facebook.com', 'CNAME', false));
bind('dns-query-example-mx', 'onclick', () => setDnsResolverInputs('gmail.com', 'MX', false));
bind('dns-query-example-ns', 'onclick', () => setDnsResolverInputs('youtube.com', 'NS', false));
bind('dns-query-example-ptr', 'onclick', () => setDnsResolverInputs('47.224.172.17.in-addr.arpa', 'PTR', false));
bind('dns-query-example-soa', 'onclick', () => setDnsResolverInputs('amazon.com', 'SOA', false));
bind('dns-query-example-srv', 'onclick', () => setDnsResolverInputs('_submission._tcp.gmail.com', 'SRV', false));
bind('dns-query-example-txt', 'onclick', () => setDnsResolverInputs('ef1p.com', 'TXT', false));

bind('dns-query-ns-.', 'onclick', () => setDnsResolverInputs('.', 'NS', false));
bind('dns-query-ns-com.', 'onclick', () => setDnsResolverInputs('com.', 'NS', false));
bind('dns-query-ns-ef1p.com.', 'onclick', () => setDnsResolverInputs('ef1p.com.', 'NS', false));

bind('dns-query-example-dnskey', 'onclick', () => setDnsResolverInputs('.', 'DNSKEY', true));
bind('dns-query-example-ds', 'onclick', () => setDnsResolverInputs('com.', 'DS', true));
bind('dns-query-example-rrsig', 'onclick', () => setDnsResolverInputs('.', 'RRSIG', true));
bind('dns-query-example-nsec', 'onclick', () => setDnsResolverInputs('nonexistent.example.com.', 'A', true));
bind('dns-query-example-nsec3', 'onclick', () => setDnsResolverInputs('com.', 'A', true));
bind('dns-query-example-nsec3param', 'onclick', () => setDnsResolverInputs('ef1p.com.', 'NSEC3PARAM', true));
bind('dns-query-example-cds', 'onclick', () => setDnsResolverInputs('switch.ch.', 'CDS', true));
bind('dns-query-example-cdnskey', 'onclick', () => setDnsResolverInputs('switch.ch.', 'TYPE60', true));

bind('dns-query-dnskey-.', 'onclick', () => setDnsResolverInputs('.', 'DNSKEY', true));
bind('dns-query-a-nonexistent.example.com.', 'onclick', () => setDnsResolverInputs('nonexistent.example.com.', 'A', true));
bind('dns-query-nsec-www.example.com.', 'onclick', () => setDnsResolverInputs('www.example.com.', 'NSEC', true));
bind('dns-query-mx-www.example.com.', 'onclick', () => setDnsResolverInputs('www.example.com.', 'MX', true));

bind('dns-query-a-google.com.', 'onclick', () => setDnsResolverInputs('google.com', 'A'));

bind('zone-walker-br.', 'onclick', () => setZoneWalkerInputFields('br.', 25));
bind('zone-walker-bg.', 'onclick', () => setZoneWalkerInputFields('bg.', 25));
bind('zone-walker-lk.', 'onclick', () => setZoneWalkerInputFields('lk.', 25));
bind('zone-walker-tn.', 'onclick', () => setZoneWalkerInputFields('tn.', 25));
bind('zone-walker-help.', 'onclick', () => setZoneWalkerInputFields('help.', 25));
bind('zone-walker-link.', 'onclick', () => setZoneWalkerInputFields('link.', 25));
bind('zone-walker-photo.', 'onclick', () => setZoneWalkerInputFields('photo.', 25));
