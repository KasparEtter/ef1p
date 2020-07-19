import { normalizeToArray } from '../../utility/functions';

export const recordTypes = {
    A: 'A: IPv4 address',
    AAAA: 'AAAA: IPv6 address',
    CAA: 'CAA: CA authorization',
    CNAME: 'CNAME: canonical name',
    MX: 'MX: mail exchange',
    NS: 'NS: name server',
    PTR: 'PTR: pointer resource',
    SOA: 'SOA: start of authority',
    SRV: 'SRV: service',
    TXT: 'TXT: text',
    DNSKEY: 'DNSKEY: DNS public key',
    DS: 'DS: delegation signer',
    RRSIG: 'RRSIG: record signature',
    NSEC: 'NSEC: next secure record',
    NSEC3: 'NSEC3: NSEC version 3',
    NSEC3PARAM: 'NSEC3PARAM[eters]',
};

export type RecordType = keyof typeof recordTypes;

export const recordTypesById: { [key: number]: RecordType | undefined } = {
    1: 'A',
    28: 'AAAA',
    257: 'CAA',
    5: 'CNAME',
    15: 'MX',
    2: 'NS',
    12: 'PTR',
    6: 'SOA',
    33: 'SRV',
    16: 'TXT',
    48: 'DNSKEY',
    43: 'DS',
    46: 'RRSIG',
    47: 'NSEC',
    50: 'NSEC3',
    51: 'NSEC3PARAM',
}

// See https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-6.
export const responseStatusCodes: { [key: number]: string | undefined } = {
    0: 'The status code of the response says that no error occurred.',
    2: 'The status code of the response says that there was a server failure. This might be due to invalid DNSSEC records.',
    3: 'The status code of the response says that no such domain exists.',
}

export interface DnsRecord {
    name: string;
    ttl: number;
    type: RecordType;
    data: string; // Removed quotes in case of TXT records, original string otherwise.
}

export interface DnsResponse {
    status: number;
    answer: DnsRecord[]; // Can be empty.
    authority: DnsRecord[]; // Can be empty.
}

interface GoogleDnsRecord {
    name: string;
    type: number;
    TTL: number;
    data: string;
}

interface GoogleDnsResponse {
    Status: number;
    Answer?: GoogleDnsRecord[];
    Authority?: GoogleDnsRecord[];
}

// https://developers.google.com/speed/public-dns/docs/doh/json
const endpoint = 'https://dns.google/resolve?';

function normalizeRecord(record: GoogleDnsRecord): DnsRecord {
    const name = record.name;
    const type = recordTypesById[record.type];
    if (type === undefined) {
        throw new Error(`Unknown record type ${record.type}.`);
    }
    const live = record.TTL;
    const data = type === 'TXT' ? record.data.slice(1, -1).replace('""', '') : record.data;
    return { name, type, ttl: live, data };
}

export async function resolveDomainName(domainName: string, recordType: RecordType, dnssecOk: boolean): Promise<DnsResponse> {
    const parameters = {
        name: domainName,
        type: recordType,
        do: dnssecOk.toString(),
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
        const status = response.Status;
        const answer = normalizeToArray(response.Answer).map(normalizeRecord);
        const authority = normalizeToArray(response.Authority).map(normalizeRecord);
        return { status, answer, authority };
    });
}
