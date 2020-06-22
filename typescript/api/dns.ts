import { normalizeToArray } from '../utility/functions';

export const recordTypes = {
    a: 'A: IPv4 address',
    aaaa: 'AAAA: IPv6 address',
    caa: 'CAA: CA authorization',
    cname: 'CNAME: canonical name',
    mx: 'MX: mail exchange',
    ns: 'NS: name server',
    ptr: 'PTR: pointer resource',
    soa: 'SOA: start of authority',
    srv: 'SRV: service',
    txt: 'TXT: text',
};

export type RecordType = keyof typeof recordTypes;

export const recordTypesById: { [key: number]: RecordType | undefined } = {
    1: 'a',
    28: 'aaaa',
    257: 'caa',
    5: 'cname',
    15: 'mx',
    2: 'ns',
    12: 'ptr',
    6: 'soa',
    33: 'srv',
    16: 'txt',
}

export interface DnsRecord {
    name: string;
    type: RecordType;
    data: string; // Removed quotes in case of TXT records, original string otherwise.
}

export interface DnsResponse {
    records: DnsRecord[]; // Can be empty.
}

interface GoogleDnsAnswer {
    name: string;
    type: number;
    TTL: number;
    data: string;
}

interface GoogleDnsResponse {
    Answer?: GoogleDnsAnswer[];
}

const endpoint = 'https://dns.google/resolve?';

export async function resolveDomainName(domainName: string, recordType: RecordType): Promise<DnsResponse> {
    const parameters = {
        name: domainName,
        type: recordType,
    };
    return fetch(endpoint + new URLSearchParams(parameters).toString(), {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => {
        if (!response.ok) {
            throw new Error(`The domain name could not be resolved. The response status was ${response.status}.`);
        }
        return response.json() as Promise<GoogleDnsResponse>;
    }).then(response => {
        const answers: GoogleDnsAnswer[] = normalizeToArray(response.Answer);
        const records: DnsRecord[] = answers.map(answer => {
            const name = answer.name;
            const type = recordTypesById[answer.type];
            if (type === undefined) {
                throw new Error(`Unknown record type ${answer.type}.`);
            }
            const data = type === 'txt' ? answer.data.slice(1, -1).replace('""', '') : answer.data;
            return { name, type, data };
        });
        return { records };
    });
}
