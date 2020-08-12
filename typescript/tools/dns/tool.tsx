import { createElement, Fragment } from 'react';

import { toLocalDateWithTime } from '../../utility/date';

import { AllEntries, DynamicEntries, DynamicEntry, getCurrentState, getDefaultPersistedState, PersistedState, ProvidedDynamicEntries, setState, StateWithOnlyValues } from '../../react/entry';
import { RawInput, RawInputProps } from '../../react/input';
import { shareState, shareStore } from '../../react/share';
import { PersistedStore, Store } from '../../react/store';
import { getUniqueKey, join } from '../../react/utility';

import { setIpInfoInput } from '../ip/tool';

import { DnsRecord, DnsResponse, RecordType, recordTypes, resolveDomainName, responseStatusCodes } from './api';

interface DnsResponseState {
    response?: DnsResponse;
    error?: string;
}

function parseTimeToLive(ttl: number): string {
    if (ttl > 129600) {
        return (ttl % 86400 !== 0 ? '~' : '') + Math.round(ttl / 86400) + ' days';
    } else if (ttl > 5400) {
        return (ttl % 3600 !== 0 ? '~' : '') + Math.round(ttl / 3600) + ' hours';
    } else if (ttl > 90) {
        return (ttl % 60 !== 0 ? '~' : '') + Math.round(ttl / 60) + ' minutes';
    } else {
        return ttl + ' seconds';
    }
}

export function getReverseLookupDomain(ipAddress: string): string {
    return ipAddress.split('.').reverse().join('.') + '.in-addr.arpa';
}

const dnskeyFlags: { [key: string]: string | undefined } = {
    '0': 'The DNS public key in this record may not be used to verify RRSIG records.',
    '256': 'The DNS public key in this record can be used to verify RRSIG records. It is marked as a zone-signing key (ZSK).',
    '257': 'The DNS public key in this record can be used to verify RRSIG records. It is marked as a key-signing key (KSK).',
};

const dnskeyFlagsDefault = 'This record uses flags which are not supported by this tool.';

const dnskeyAlgorithms: { [key: string]: string | undefined } = {
    '0': 'This value asks the parent zone to disable DNSSEC for this child zone. It can only be used in CDS and CDNSKEY records. See the section 4 of RFC 8078 for more information.',
    '8': 'This record contains an RSA public key whose private key is used to sign the SHA-256 hash of a message.',
    '13': 'This record contains an ECDSA public key whose private key is used to sign the SHA-256 hash of a message.',
    '14': 'This record contains an ECDSA public key whose private key is used to sign the SHA-384 hash of a message.',
    '15': 'This record contains an Ed25519 public key.',
    '16': 'This record contains an Ed448 public key.',
};

const dnskeyAlgorithmsDefault = 'This record contains a public key whose algorithm is either not known to this tool or not recommended.';

const dnskeyAlgorithmsShort: { [key: string]: string | undefined } = {
    '8': 'RSA/SHA-256',
    '13': 'ECDSA/SHA-256',
    '14': 'ECDSA/SHA-384',
    '15': 'Ed25519',
    '16': 'Ed448',
};

const dsDigests: { [key: string]: string | undefined } = {
    '1': 'SHA-1',
    '2': 'SHA-256',
    '3': 'GOST R 34.10-2001',
    '4': 'SHA-384',
};

interface Field {
    title: string | ((field: string, record: DnsRecord) => string);
    onClick?: (field: string, record: DnsRecord) => any;
    onContextMenu?: (field: string, record: DnsRecord) => any;
    transform?: (field: string, record: DnsRecord) => string;
}

interface Pattern {
    regexp: RegExp;
    fields: Field[]; // One field required for each part after splitting the data by space.
}

type Parser = (record: DnsRecord) => JSX.Element;

const onClick = (field: string) => setDnsResolverInputs(field, 'A');
const onContextMenu = (field: string) => window.open('http://' + field.slice(0, -1));

const DNSKEY: Pattern = {
    regexp: /^\d+ \d+ \d+ (?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/,
    fields: [
        { title: field => 'Flags: ' + (dnskeyFlags[field] ?? dnskeyFlagsDefault) },
        { title: 'Protocol: For DNSSEC, this value has to be 3.' },
        { title: field => 'Algorithm: ' + (dnskeyAlgorithms[field] ?? dnskeyAlgorithmsDefault) },
        { title: 'The public key encoded in Base64.' },
    ],
};

const DS: Pattern = {
    regexp: /^\d+ \d+ \d+ [A-F0-9]+$/,
    fields: [
        { title: 'Key tag: This value allows resolvers to quickly determine which key is referenced. The value is calculated according to appendix B of RFC 4034. It is basically the DNSKEY record data split into chunks of 16 bits and then summed up.' },
        { title: field => `Algorithm: The same value as in the corresponding DNSKEY record. (${field} stands for ${dnskeyAlgorithmsShort[field] ?? 'an unsupported or not recommended algorithm'}.)` },
        { title: field => `Digest type: This value identifies the algorithm used to hash the public key. (${field} stands for ${dsDigests[field] ?? 'a hash algorithm which is not known to this tool'}.)` },
        { title: field => `Digest: The hash of the public key in the delegated zone. It is displayed in hexadecimal notation, which means that each character represents 4 bits. Since the hash consists of ${field.length} hexadecimal characters, it encodes ${field.length * 4} bits.` },
    ],
};

const recordTypePatterns: { [key in RecordType]: Pattern | Parser } = {
    ANY: record => <span>{record.data}</span>, // Only needed for TypeScript.
    A: {
        regexp: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
        fields: [{
            title: (_, record) => `The IPv4 address of ${record.name} Click to do a reverse lookup. Right click to geolocate the IP address.`,
            onClick: field => setDnsResolverInputs(getReverseLookupDomain(field), 'PTR'),
            onContextMenu: field => { setIpInfoInput(field); window.location.hash = '#tool-ip-info'; },
        }],
    },
    AAAA: {
        regexp: /^.+$/,
        fields: [{ title: (_, record) => `The IPv6 address of ${record.name}` }],
    },
    CAA: {
        regexp: /^\d{1,3} (issue|issuewild|iodef) "\S+"$/,
        fields: [
            // tslint:disable-next-line: no-bitwise
            { title: field => 'The most significant bit of this number is the issuer critical flag. ' + ((parseInt(field, 10) & 128) ?
                'Because this bit is set to 1, a certificate issuer has to understand the subsequent property before issuing a certificate.' :
                'Because this bit is set to 0, a certificate issuer may issue a certificate without understanding the subsequent property.'
            ) + ' Since the subsequent property has been defined in the original standard (RFC 6844), this flag only matters for future versions of the CAA record with new property types.' },
            { title: field =>
                field === 'issue' && 'The "issue" property authorizes the holder and only the holder of the domain name in the subsequent value to issue normal certificates for the queried domain name.' ||
                field === 'issuewild' && 'The "issuewild" property authorizes the holder and only the holder of the domain name in the subsequent value to issue wildcard certificates for the queried domain name.' ||
                field === 'iodef' && 'The "iodef" (Incident Object Description Exchange Format) property indicates how an unauthorized certificate issuer can report a fraudulent certificate request to the holder of the queried domain name.' ||
                'Error' },
            { title: 'The value which is to be interpreted according to the preceding property.' },
        ],
    },
    CNAME: {
        regexp: /^([a-z0-9_]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\.$/i,
        fields: [{ title: (_, record) => `The domain name for which ${record.name.slice(0, -1)} is an alias. Click to look up its resource records of the same type. Right click to open the domain in your browser.`, onClick: field => setState(store, { domainName: field }), onContextMenu }],
    },
    MX: {
        regexp: /^\d+ ([a-z0-9_]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\.$/i,
        fields: [
            { title: 'The priority of the subsequent host. The lower the value, the higher the priority. Several records with the same priority can be used for load balancing, otherwise additional records simply provide redundancy.' },
            { title: (_, record) => `A host which handles incoming mail for ${record.name} Click to look up its IPv4 address. The host name must resolve directly to one or more address records without involving CNAME records.`, onClick },
        ],
    },
    NS: {
        regexp: /^([a-z0-9_]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\.$/i,
        fields: [{ title: (_, record) => `An authoritative name server for the DNS zone starting at ${record.name} Click to look up its IPv4 address.`, onClick }],
    },
    PTR: {
        regexp: /^([a-z0-9_]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\.$/i,
        fields: [{ title: 'This is typically the domain name from a reverse DNS lookup. Click to look up its IPv4 address. If it matches the IP address that was looked up in reverse, then the domain holder also holds that IP address. Without a match, the reference in either direction can be fraudulent. Right click to open the domain in your browser.', onClick, onContextMenu }],
    },
    SOA: {
        regexp: /^([a-z0-9_]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\. ([a-z0-9_]+(-[a-z0-9]+)*(\\)?\.)+[a-z]{2,63}\. \d+ \d+ \d+ \d+ \d+$/i,
        fields: [
            { title: (_, record) => `The primary name server for the DNS zone ${record.name} Click to look up its IPv4 address.`, onClick },
            { title: field => 'The email address of the administrator responsible for this zone. The first non-escaped period is replaced with an @, so the address actually is ' + field.replace(/\\\./g, ':').replace('.', '@').replace(/:/g, '.') }, // The closing period is coming from the domain name itself.
            { title: 'The serial number for this zone. If it increases, then the zone has been updated.' },
            { title: 'The number of seconds after which secondary name servers should query the primary name server again in order to refresh their copy.' },
            { title: 'The number of seconds after which secondary name servers should retry to request the serial number from the primary name server if it does not respond.' },
            { title: 'The number of seconds after which secondary name servers should stop answering requests for this zone if the primary name server no longer responds.' },
            { title: 'The number of seconds for which the non-existence of a resource record can be cached by DNS resolvers.' },
        ],
    },
    SPF: record => <span className="static-output" title={`This record specifies the IP addresses of the outgoing mail servers of ${record.name} SPF stands for Sender Policy Framework. This record type has been obsoleted by RFC 7208. You should just use a TXT record for this now.`}>{record.data}</span>,
    SRV: {
        regexp: /^\d+ \d+ \d+ (([a-z0-9_]+(-[a-z0-9]+)*\.)+[a-z]{2,63})?\.$/i,
        fields: [
            { title: 'The priority of the host at the end of this record. Clients should use the SRV record with the lowest priority value first and fall back to records with higher priority values if the connection fails.' },
            { title: 'A relative weight for records with the same priority. If a service has multiple SRV records with the same priority value, each client should load balance them in proportion to the values of their weight fields.' },
            { title: 'The TCP or UDP port on which the service can be found.' },
            { title: field => 'The host which provides the service. ' + (field === '.' ? 'The period means that the service is not available at this domain.' : 'Click to look up its IPv4 address.'), onClick },
        ],
    },
    // TODO: Support SPF, DKIM, DMARC, etc.
    TXT: record => <span className="static-output" title="The arbitrary, text-based data of this record.">{record.data}</span>,
    DNSKEY,
    DS,
    RRSIG: {
        regexp: /^[a-z0-9]{1,10} \d+ \d+ \d+ \d+ \d+ \d+ (([a-z0-9_]+(-[a-z0-9]+)*\.)*[a-z]{2,63})?\. (?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/i,
        fields: [
            { title: field => `Type covered: The record type covered by the signature in this record. A DNSSEC signature covers all the records of the given type. The records are first sorted, then hashed and signed collectively. (${recordTypes[field.toUpperCase() as RecordType] ?? 'Unsupported record type.'})`, transform: field => field.toUpperCase() },
            { title: field => `Algorithm: This number identifies the cryptographic algorithm used to create and verify the signature. (${field} stands for ${dnskeyAlgorithmsShort[field] ?? 'an unsupported or not recommended algorithm'}.)` },
            { title: `Labels: The number of labels in the domain name to which this record belongs. The empty label for the root and a potential wildcard label are not counted. For example, '*.example.com.' has a label count of 2. This allows a validator to determine whether the answer was synthesized for a wildcard subdomain. Since the signature covers the wildcard label instead of the queried subdomain, a validator needs to be able to detect this in order to verify the signature successfully.` },
            { title: field => `Original TTL: Since the actual time to live value is decremented when a cached record is returned, the original time to live value of the signed record needs to be provided in this RRSIG record in order to be able to verify the signature, which covers this value. (${field} seconds are ${parseTimeToLive(Number.parseInt(field, 10))}.)` },
            { title: field => `Signature expiration: The signature in this record may not be used to authenticate the signed resource records after ${toLocalDateWithTime(field)}. The date is encoded as the number of seconds elapsed since 1 January 1970 00:00:00 UTC. For record types other than DNSKEY and DS used for key-signing keys (KSKs), the expiration date shouldn't be too far in the future as it limits for how long an attacker can successfully replay stale resource records, which have been replaced by the domain owner.` },
            { title: field => `Signature inception: The signature in this record may not be used to authenticate the signed resource records before ${toLocalDateWithTime(field)}. The date is encoded as the number of seconds elapsed since 1 January 1970 00:00:00 UTC. The inception date allows you to already sign records which you intend to publish at a certain point in the future without risking that the signature can be misused until then.` },
            { title: 'Key tag: This value allows resolvers to quickly determine which key needs to be used to verify the signature in this record. The value is calculated according to appendix B of RFC 4034. It is basically the DNSKEY record data split into chunks of 16 bits and then summed up.' },
            { title: 'Signer name: The domain name with the DNSKEY record that contains the public key to validate this signature. It has to be the name of the zone that contains the signed resource records. Click to look up the DNSKEY records of this domain.', onClick: field => setDnsResolverInputs(field, 'DNSKEY') },
            { title: 'Signature: The signature value encoded in Base64.' },
        ],
    },
    NSEC: record => {
        const availableTypes = record.data.split(' ');
        const nextDomain = availableTypes.splice(0, 1)[0];
        return <Fragment>
            <span
                className="dynamic-output"
                title={`This is the next domain name in this zone. This record indicates that no domain exists between ${record.name.slice(0, -1)} and ${nextDomain} Click to look up its next domain name. Right click to open the domain in your browser.`}
                onClick={() => setDnsResolverInputs(nextDomain, 'NSEC')}
                onContextMenu={event => { onContextMenu(nextDomain); event.preventDefault(); }}
            >{nextDomain}</span>{' '}
            {join((availableTypes as RecordType[]).map(
                recordType => <span
                    className={recordTypes[recordType] ? 'dynamic-output' : 'static-output'}
                    title={`This entry indicates that ${record.name.slice(0, -1)} has ${['A', 'M', 'N', 'R', 'S'].includes(recordType[0]) ? 'an' : 'a'} ${recordType} record. Click to look up this record type.`}
                    onClick={recordTypes[recordType] ? () => setDnsResolverInputs(record.name, recordType) : undefined }
                >{recordType}</span>,
            ))}
        </Fragment>;
    },
    NSEC3: record => {
        const availableTypes = record.data.split(' ');
        const [ algorithm, flags, iterations, salt, nextDomain ] = availableTypes.splice(0, 5);
        const owner = record.name.substring(0, record.name.indexOf('.'));
        return <Fragment>
            <span className="static-output"
                title="Algorithm: This value identifies the cryptographic hash function used to hash the subdomains in this zone. 1 stands for SHA-1, which is the only algorithm currently supported."
            >{algorithm}</span>{' '}
            <span className="static-output"
                title={`Opt-out flag: If this value is 1, there can be unsigned subzones whose hash is between ${owner} and ${nextDomain}. Otherwise, there are no unsigned subzones that fall in this range. By skipping all subzones that don't deploy DNSSEC, the size of this zone can be reduced as fewer NSEC3 records are required.`}
            >{flags}</span>{' '}
            <span className="static-output"
                title="Iterations: This value specifies how many additional times the hash function is applied to a subdomain name. (A value of 0 means that the subdomain name is hashed only once in total.) By hashing the result of the hash function again, then its result again and so on, the computational cost to brute-force the name of the hashed subdomain can be increased."
            >{iterations}</span>{' '}
            <span className="static-output"
                title="Salt: Optionally, an arbitrary value can be provided here to be mixed into the hash function in order to make pre-calculated dictionary attacks harder. This prevents an attacker from simultaneously brute-forcing the subdomains of zones which use different salts."
            >{salt}</span>{' '}
            <span className="static-output"
                title={`This is the hash of the next domain name in this zone. This record indicates that no other subdomain hashes to a value between ${owner} and ${nextDomain} (with the exception of unsigned subzones if the opt-out flag is set).`}
            >{nextDomain}</span>{' '}
            {join((availableTypes as RecordType[]).map(
                recordType => <span className="static-output"
                    title={`This entry indicates that the subdomain which hashes to ${owner} has ${['A', 'M', 'N', 'R', 'S'].includes(recordType[0]) ? 'an' : 'a'} ${recordType} record.`}
                >{recordType}</span>,
            ))}
        </Fragment>;
    },
    NSEC3PARAM: {
        regexp: /^\d+ \d+ \d+ ([a-f0-9]+|-)$/,
        fields: [
            { title: 'Algorithm: This value identifies the cryptographic hash function used to hash the subdomains in this zone. 1 stands for SHA-1, which is the only algorithm currently supported.' },
            { title: 'Flags: The opt-out flag (see an NSEC3 record for more information) is set to zero in NSEC3PARAM records. Since all other flags are still reserved for future use and thus also set to zero, this value should be zero.' },
            { title: 'Iterations: This value specifies how many additional times the hash function is applied to a subdomain name. (A value of 0 means that the subdomain name is hashed only once in total.) By hashing the result of the hash function again, then its result again and so on, the computational cost to brute-force the name of the hashed subdomain can be increased.' },
            { title: 'Salt: Optionally, an arbitrary value can be provided here to be mixed into the hash function in order to make pre-calculated dictionary attacks harder. This prevents an attacker from simultaneously brute-forcing the subdomains of zones which use different salts.' },
        ],
    },
    CDS: DS,
    TYPE60: DNSKEY, // Google doesn't provide a parsed answer, unfortunately: https://issuetracker.google.com/issues/162137940
};

function parseDnsData(record: DnsRecord): JSX.Element {
    if (typeof record.type === 'number') {
        return <span title="The data of this unsupported record type.">{record.data}</span>;
    }
    const pattern = recordTypePatterns[record.type];
    if (typeof pattern === 'function') {
        return pattern(record);
    } else {
        if (pattern.regexp.test(record.data)) {
            const fields = record.data.split(' ');
            return join(fields.map((field, index) => {
                const title = pattern.fields[index].title;
                const onClick = pattern.fields[index].onClick;
                const onContextMenu = pattern.fields[index].onContextMenu;
                const transform = pattern.fields[index].transform;
                return <span
                    className={onClick ? 'dynamic-output' : 'static-output'}
                    title={typeof title === 'function' ? title(field, record) : title}
                    onClick={onClick ? () => onClick(field, record) : undefined}
                    onContextMenu={onContextMenu ? event => { onContextMenu(field, record); event.preventDefault(); } : undefined}
                >{transform ? transform(field, record) : field}</span>
            }));
        } else {
            console.error(`The ${record.type} record '${record.data}' didn't match the expected pattern.`);
            return <span title="The data of this record didn't match the expected pattern.">{record.data}</span>;
        }
    }
}

function turnRecordsIntoTable(records: DnsRecord[]): JSX.Element {
    return <table className="dynamic-output-pointer">
        <thead>
            <th>Domain name</th>
            <th>Time to live</th>
            <th>Record type</th>
            <th>Record data</th>
        </thead>
        <tbody>
            {records.map(record => <tr key={getUniqueKey()}>
                <td>{record.name}</td>
                <td title={record.ttl + ' seconds'}>{parseTimeToLive(record.ttl)}</td>
                <td>{typeof record.type === 'number' ? 'Unsupported type ' + record.type : recordTypes[record.type]}</td>
                <td>{parseDnsData(record)}</td>
            </tr>)}
        </tbody>
    </table>;
}

function RawDnsResponseTable({ response, error }: Readonly<DnsResponseState>): JSX.Element | null {
    if (error) {
        return <p>The domain name could not be resolved. Reason: {error}</p>;
    } else if (response) {
        return <Fragment>
            {
                response.status !== 0 &&
                <p className="text-center">{responseStatusCodes[response.status] ?? 'The response has a status code which is not supported by this tool.'}</p>
            }
            {
                response.status === 0 && response.authority.length > 0 &&
                <p className="table-title">Answer section</p>
            }
            {
                response.status === 0 && response.answer.length === 0 &&
                <p className="text-center">No records found for this domain name and record type.</p>
            }
            {
                response.answer.length > 0 &&
                turnRecordsIntoTable(response.answer)
            }
            {
                response.authority.length > 0 &&
                <Fragment>
                    <p className="table-title">Authority section</p>
                    {turnRecordsIntoTable(response.authority)}
                </Fragment>
            }
            {
                (response.answer.length > 0 || response.authority.length > 0) && getCurrentState(store).dnssecOk &&
                <p className="text-center">
                    ⚠️ Please note that this tool doesn't verify DNSSEC signatures.
                    If you rely on its answers, you do so at your own risk!
                </p>
            }
        </Fragment>;
    } else {
        return null; // Nothing is displayed initially.
    }
}

const dnsResponseStore = new Store<DnsResponseState>({}, undefined);
const DnsResponseTable = shareState<DnsResponseState>(dnsResponseStore)(RawDnsResponseTable);

function updateDnsResponseTable({ domainName, recordType, dnssecOk }: State): void {
    resolveDomainName(domainName, recordType as RecordType, dnssecOk)
    .then(response => dnsResponseStore.setState({ response, error: undefined }))
    .catch(error => dnsResponseStore.setState({ error: error.message }));
}

const domainName: DynamicEntry<string> = {
    name: 'Domain',
    description: 'The domain name you are interested in.',
    defaultValue: 'ef1p.com',
    inputType: 'text',
    labelWidth: 60,
    inputWidth: 255,
    validate: value =>
        value === '' && 'The domain name may not be empty.' || // Redundant to the regular expression, just a more specific error message.
        value.includes(' ') && 'The domain name may not contain spaces.' || // Redundant to the regular expression, just a more specific error message.
        value.length > 253 && 'The domain name may be at most 253 characters long.' ||
        !value.split('.').every(label => label.length < 64) && 'Each part may be at most 63 characters long.' ||
        !/^[a-z0-9-_\.]+$/i.test(value) && 'Only the Latin alphabet is currently supported.' ||
        !/^(([a-z0-9_]+(-[a-z0-9]+)*\.)*[a-z]{2,63})?\.?$/i.test(value) && 'The pattern of the domain name is invalid.',
};

const recordType: DynamicEntry<string> = {
    name: 'Type',
    description: 'The DNS record type you want to query.',
    defaultValue: 'A',
    inputType: 'select',
    labelWidth: 38,
    selectOptions: recordTypes,
};

const dnssecOk: DynamicEntry<boolean> = {
    name: 'DNSSEC',
    description: 'Whether to include DNSSEC records in the answer.',
    defaultValue: false,
    inputType: 'switch',
    labelWidth: 66,
};

interface State extends StateWithOnlyValues {
    domainName: string;
    recordType: string;
    dnssecOk: boolean;
}

const entries: DynamicEntries<State> = {
    domainName,
    recordType,
    dnssecOk,
};

const store = new PersistedStore<PersistedState<State>, AllEntries<State>>(getDefaultPersistedState(entries), { entries, onChange: updateDnsResponseTable }, 'dns');
const Input = shareStore<PersistedState<State>, ProvidedDynamicEntries<State> & RawInputProps, AllEntries<State>>(store)(RawInput);

export function setDnsResolverInputs(domainName: string, recordType: RecordType, dnssecOk?: boolean): void {
    setState(store, dnssecOk === undefined ? { domainName, recordType } : { domainName, recordType, dnssecOk });
}

export const dnsTool = <Fragment>
    <Input entries={{ domainName, recordType, dnssecOk }} horizontal submit="Query"/>
    <DnsResponseTable/>
</Fragment>;

export function bindDnsQueries() {
    Array.from(document.getElementsByClassName('dns-query') as HTMLCollectionOf<HTMLElement>).forEach(element => {
        const { domain, type, dnssec } = element.dataset;
        if (domain === undefined || !Object.keys(recordTypes).includes(type!) || !['true', 'false'].includes(dnssec!)) {
            console.error('The data attributes of the following element are invalid:', element);
        } else {
            element.addEventListener('click', () => setDnsResolverInputs(domain, type as RecordType, dnssec === 'true'));
        }
    });
}
