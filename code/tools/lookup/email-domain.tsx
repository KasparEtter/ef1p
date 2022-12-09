/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { flatten, getLastElement } from '../../utility/array';
import { copyToClipboard } from '../../utility/clipboard';
import { getErrorMessage } from '../../utility/error';
import { fetchWithError } from '../../utility/fetch';
import { Dictionary } from '../../utility/record';
import { splitOnFirstOccurrence } from '../../utility/string';
import { Button } from '../../utility/types';

import { CodeBlock } from '../../react/code';
import { ClickToCopy } from '../../react/copy';
import { BasicValue, DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { Store } from '../../react/store';
import { getUniqueKey } from '../../react/utility';
import { VersionedStore } from '../../react/versioned-store';

import { getAllRecords, getDataOfFirstRecord, isAuthenticated, RecordType, resolveDomainName } from '../../apis/dns-lookup';
import { Configuration, Documentation, findConfigurationFile, Server } from '../../apis/email-configuration';
import { getIpInfo, IpInfoResponse } from '../../apis/ip-geolocation';

import { DkimState, getDefaultDkimState, setDkimState } from '../format/dkim';
import { dmarcAddressRegex, DmarcState, getDefaultDmarcState, setDmarcState } from '../format/dmarc';

import { getOpenSslCommand } from '../protocol/managesieve';

import { endpoint, secure } from './email-requests';
import { getMapLink } from './ip-address';

/* ------------------------------ SRV records ------------------------------ */

const protocols = {
    SUBMISSION: '_submission',
    SUBMISSIONS: '_submissions',
    IMAP: '_imap',
    IMAPS: '_imaps',
    POP3: '_pop3',
    POP3S: '_pop3s',
    JMAP: '_jmap',
    SIEVE: '_sieve',
};

type Protocol = keyof typeof protocols;

interface Service {
    protocol: Protocol;
    priority: number;
    weight: number;
    port: number;
    host: string;
}

interface SrvRecordsState {
    available: Service[];
    unavailable: Protocol[];
    dnssec: boolean;
    error?: string | undefined;
}

function dnssecParagraph(dnssec: boolean): JSX.Element {
    return dnssec ?
        <p className="text-center">
            <i className="mr-1 fas fa-info-circle color-green"></i>
            The entries are authenticated with DNSSEC but this tool doesn't verify the signatures.
        </p>
    :
        <p className="text-center">
            <i className="mr-1 fas fa-exclamation-circle color-red"></i>
            The entries are not authenticated with DNSSEC, which poses a serious security risk.
        </p>;
}

function RawSrvRecordsOutput({ available, unavailable, dnssec, error }: Readonly<SrvRecordsState>): JSX.Element {
    if (error) {
        return <p>An error occurred: {error}</p>;
    } else {
        const domain = store.getCurrentState().domain;
        return <Fragment>
            {
                available.length > 0 &&
                <Fragment>
                    <p className="text-center">
                        <a href={'http://' + domain}>{domain}</a> provides the following service{available.length > 1 ? 's' : ''}:
                    </p>
                    <table>
                        <thead>
                            <th>Protocol</th>
                            <th>Priority</th>
                            <th>Weight</th>
                            <th>Port</th>
                            <th>Host</th>
                        </thead>
                        <tbody>
                            {available.map(service => <tr key={getUniqueKey()}>
                                <td>{service.protocol}</td>
                                <td>{service.priority}</td>
                                <td>{service.weight}</td>
                                <td>{service.port}</td>
                                <td>{service.host}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </Fragment>
            }
            {
                unavailable.length > 0 &&
                <p className="text-center">
                    <a href={'http://' + domain}>{domain}</a> does not provide the following
                    service{unavailable.length > 1 ? 's' : ''}: {unavailable.join(', ')}.
                </p>
            }
            {
                (available.length > 0 || unavailable.length > 0) && dnssecParagraph(dnssec)
            }
        </Fragment>;
    }
}

const srvRecordsStore = new Store<SrvRecordsState>({ available: [], unavailable: [], dnssec: false });
const SrvRecordsOutput = srvRecordsStore.injectState<{}>(RawSrvRecordsOutput);

async function querySrvRecords({ domain }: State): Promise<void> {
    domain = domain.toLowerCase();
    try {
        let dnssec = true;
        const promises = (Object.keys(protocols) as Protocol[]).map(async protocol => {
            const serviceDomain = protocols[protocol] + '._tcp.' + domain;
            const response = await resolveDomainName(serviceDomain, 'SRV', true);
            const services = response.answer.filter(record => record.type === 'SRV').map(record => {
                const parts = record.data.split(' ');
                if (parts.length !== 4) {
                    throw new Error('Received an invalid SRV record.');
                }
                const priority = parseInt(parts[0], 10);
                const weight = parseInt(parts[1], 10);
                const port = parseInt(parts[2], 10);
                const host = parts[3];
                return { protocol, priority, weight, port, host } as Service;
            });
            dnssec &&= (services.length === 0 || isAuthenticated(response, serviceDomain, 'SRV'));
            return services;
        });
        const services = await Promise.all(promises);
        const available: Service[] = [];
        const unavailable: Protocol[] = [];
        flatten(services).forEach(service => {
            if (service.host === '.') {
                unavailable.push(service.protocol);
            } else {
                available.push(service);
            }
        });
        if (available.length === 0 && unavailable.length === 0) {
            srvRecordsStore.setState({ available: [], unavailable: [], dnssec: false, error: domain + ' has no SRV records for email.' });
        } else {
            srvRecordsStore.setState({ available, unavailable, dnssec, error: undefined });
        }
    } catch (error) {
        srvRecordsStore.setState({ available: [], unavailable: [], dnssec: false, error: getErrorMessage(error) });
    }
}

/* ------------------------------ Configuration database ------------------------------ */

const minWidth = 320;

interface ConfigurationDatabaseState {
    requests: string[];
    configuration?: Configuration | undefined;
}

interface Explanation {
    content: string;
    tooltip: string;
}

const encryption: Dictionary<Explanation> = {
    'SSL': {
        content: 'TLS',
        tooltip: 'Formerly called SSL.',
    },
    'STARTTLS': {
        content: 'STARTTLS',
        tooltip: 'Just called TLS in some settings.',
    },
    'plain': {
        content: 'None ⚠️',
        tooltip: 'Use a different service!',
    },
}

const username: Dictionary<Explanation> = {
    '%EMAILADDRESS%': {
        content: 'Full address',
        tooltip: 'Your full email address.',
    },
    '%EMAILLOCALPART%': {
        content: 'Local part',
        tooltip: 'The part before the @ in your email address.',
    },
}

const password: Explanation = {
    content: 'Password',
    tooltip: 'The password is transmitted with the above encryption.',
}

const authentication: Dictionary<Explanation> = {
    'plain': password,
    'password-cleartext': password,
    'password-encrypted': {
        content: 'Challenge-response',
        tooltip: 'Password-based challenge-response (CRAM-MD5). (Thunderbird calls this encrypted password, which is factually wrong.)',
    },
    'OAuth2': {
        content: 'OAuth2',
        tooltip: 'Authorize mail clients for a potentially limited scope with OAuth2.',
    },
}

function lookUp(dictionary: Dictionary<Explanation>, key: string): JSX.Element {
    const explanation = dictionary[key];
    if (explanation !== undefined) {
        return <span className="cursor-help" title={explanation.tooltip}>{explanation.content}<i className="icon-right fas fa-info-circle"></i></span>;
    } else {
        return <Fragment>{key}</Fragment>;
    }
}

function renderServers(label: string, servers: Server[]): JSX.Element[] {
    return servers.map(server => <table>
        <thead>
            <th colSpan={2} style={{ minWidth }}>{label} mail server: <span className="color-pink">{server.type.toUpperCase()}</span></th>
        </thead>
        <tbody>
            <tr>
                <td style={{ width: 130 }}>Host name:</td>
                <td><ClickToCopy>{server.host}<i className="icon-right fas fa-clipboard"></i></ClickToCopy></td>
            </tr>
            <tr>
                <td>Port number:</td>
                <td><ClickToCopy>{server.port}<i className="icon-right fas fa-clipboard"></i></ClickToCopy></td>
            </tr>
            <tr>
                <td>Encryption:</td>
                <td>{lookUp(encryption, server.socket)}</td>
            </tr>
            <tr>
                <td>User name:</td>
                <td>{lookUp(username, server.username)}</td>
            </tr>
            {server.authentication.map(method => <tr key={method}>
                <td>Authentication:</td>
                <td>{lookUp(authentication, method)}</td>
            </tr>)}
        </tbody>
    </table>);
}

function renderDocumentation(label: string, documentation: Documentation[]): JSX.Element | false {
    return documentation.length > 0 &&
        <table>
            <thead>
                <th style={{ minWidth }}>{label}</th>
            </thead>
            <tbody>
                {documentation.map(entry => <tr key={getUniqueKey()}>
                    <td><a href={entry.link}>{entry.text}</a></td>
                </tr>)}
            </tbody>
        </table>;
}

function RawConfigurationDatabaseOutput({ requests, configuration }: Readonly<ConfigurationDatabaseState>): JSX.Element {
    const domain = store.getCurrentState().domain.toLowerCase();
    return <Fragment>
        {
            requests.length > 0 &&
            <Fragment>
                <table>
                    <thead>
                        <th colSpan={2}>Request{requests.length > 1 ? 's' : ''} made to find
                        the mail client configuration for the domain <a href={'http://' + domain}>{domain}</a>:</th>
                    </thead>
                    <tbody>
                        {requests.map((request, index) => <tr key={getUniqueKey()}>
                            <td><a href={request}>{request}</a></td>
                            <td>{
                                index === requests.length - 1 && configuration !== undefined ?
                                    <i className="fas fa-check color-green"></i> :
                                    <i className="fas fa-times color-red"></i>
                            }</td>
                        </tr>)}
                    </tbody>
                </table>
            </Fragment>
        }
        {
            configuration !== undefined &&
            <Fragment>
                <p className="text-center">
                    According to the found configuration file, the mailbox provider of <a href={'http://' + domain}>{domain}</a>{' '}
                    is {configuration.webmail ? <a href={configuration.webmail}>{configuration.name}</a> : configuration.name}.
                </p>
                <p className="text-center">
                    <i className="mr-1 fas fa-exclamation-triangle color-orange"></i>
                    Be cautious when configuring your mail client with information from untrusted sources!
                </p>
                {renderServers('Incoming', configuration.incomingServers)}
                {renderServers('Outgoing', configuration.outgoingServers)}
                {renderDocumentation('Instructions', configuration.instructions)}
                {renderDocumentation('Documentation', configuration.documentation)}
            </Fragment>
        }
    </Fragment>;
}

const configurationDatabaseStore = new Store<ConfigurationDatabaseState>({ requests: [] });
const ConfigurationDatabaseOutput = configurationDatabaseStore.injectState<{}>(RawConfigurationDatabaseOutput);

async function queryConfigurationDatabase({ domain }: State): Promise<void> {
    const requests: string[] = [];
    const configuration = await findConfigurationFile(domain.toLowerCase(), requests);
    configurationDatabaseStore.setState({ requests, configuration });
}

/* ------------------------------ MX records ------------------------------ */

interface MxRow {
    priority: number;
    domain: string;
    address: string;
    location: IpInfoResponse;
}

interface AdRow {
    address: string;
}

interface MxRecordsState {
    mxRows: MxRow[];
    adRows: AdRow[];
    dnssec: boolean;
    error?: string | undefined;
}

function RawMxRecordsOutput({ mxRows, adRows, dnssec, error }: Readonly<MxRecordsState>): JSX.Element {
    if (error) {
        return <p>An error occurred: {error}</p>;
    } else {
        const domain = store.getCurrentState().domain;
        return <Fragment>
            {
                mxRows.length > 0 &&
                <Fragment>
                    <p className="text-center">
                        <a href={'http://' + domain}>{domain}</a> has the following <code>MX</code> record{mxRows.length > 1 ? 's' : ''}:
                    </p>
                    <table>
                        <thead>
                            <th>Priority</th>
                            <th>Domain</th>
                            <th>Address</th>
                            <th>Location</th>
                        </thead>
                        <tbody>
                            {mxRows.map(mxRow => <tr key={mxRow.domain}>
                                <td><ClickToCopy>{mxRow.priority}</ClickToCopy></td>
                                <td><ClickToCopy>{mxRow.domain}</ClickToCopy></td>
                                <td><ClickToCopy>{mxRow.address}</ClickToCopy></td>
                                <td>{getMapLink(mxRow.location)}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </Fragment>
            }
            {
                mxRows.length === 0 && adRows.length > 0 &&
                <Fragment>
                    <p className="text-center">
                        <a href={'http://' + domain}>{domain}</a> has no <code>MX</code> records but the following <code>A</code> record{adRows.length > 1 ? 's' : ''}:
                    </p>
                    <table>
                        <thead>
                            <th>Address</th>
                        </thead>
                        <tbody>
                            {adRows.map(adRow => <tr key={adRow.address}>
                                <td>{adRow.address}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </Fragment>
            }
            {
                (mxRows.length > 0 || adRows.length > 0) && dnssecParagraph(dnssec)
            }
        </Fragment>;
    }
}

const mxRecordsStore = new Store<MxRecordsState>({ mxRows: [], adRows: [], dnssec: false });
const MxRecordsOutput = mxRecordsStore.injectState<{}>(RawMxRecordsOutput);

async function queryMxRecords({ domain }: State): Promise<void> {
    domain = domain.toLowerCase();
    try {
        const response = await resolveDomainName(domain, 'MX', true);
        const mxRows = await Promise.all(
            response.answer.filter(record => record.type === 'MX').map(async record => {
                const parts = record.data.split(' ');
                if (parts.length !== 2) {
                    throw new Error('Received an invalid MX record.');
                }
                const priority = parseInt(parts[0], 10);
                const mxDomain = parts[1].slice(0, -1);
                if (mxDomain === '') {
                    throw new Error(`${domain} has a null MX record, which means that it does not support email.`);
                }
                const address = await getDataOfFirstRecord(mxDomain, 'A');
                const location = await getIpInfo(address);
                return { priority, domain: mxDomain, address, location } as MxRow;
            }),
        );
        if (mxRows.length > 0) {
            mxRows.sort((a, b) => a.priority - b.priority);
            const dnssec = isAuthenticated(response, domain, 'MX');
            mxRecordsStore.setState({ mxRows, adRows: [], dnssec, error: undefined });
        } else {
            const response = await resolveDomainName(domain, 'A', true);
            const adRows = response.answer.filter(record => record.type === 'A').map(record => ({ address: record.data }));
            if (adRows.length > 0) {
                const dnssec = isAuthenticated(response, domain, 'A');
                mxRecordsStore.setState({ mxRows: [], adRows, dnssec, error: undefined });
            } else {
                mxRecordsStore.setState({ mxRows: [], adRows: [], dnssec: false, error: `${domain} has neither MX nor A records.` });
            }
        }
    } catch (error) {
        mxRecordsStore.setState({ mxRows: [], adRows: [], dnssec: false, error: getErrorMessage(error) });
    }
}

/* ------------------------------ Record output ------------------------------ */

export type RemarkType = 'info' | 'warning' | 'error';

export function getRemarkTypeClasses(type: RemarkType): string {
    switch (type) {
        case 'info': return 'fa-info-circle color-blue';
        case 'warning': return 'fa-exclamation-triangle color-orange';
        case 'error': return 'fa-exclamation-circle color-red';
    }
}

export interface Remark {
    type: RemarkType;
    text: string;
    link?: string;
}

export interface Record {
    content: string;
    remarks: Remark[];
    image?: string;
    buttons: Button<React.MouseEvent<HTMLButtonElement, MouseEvent>>[];
}

export interface Query {
    type?: RecordType;
    domain: string;
    cnames: string[];
    remarks: Remark[];
    records: Record[];
}

export async function makeQuery(domain: string, dnssecLink?: string, type: RecordType = 'TXT'): Promise<Query> {
    const response = await resolveDomainName(domain, type, true);
    const cnames: string[] = [];
    const records: Record[] = [];
    let name = domain + '.';
    for (const record of response.answer) {
        if (record.type === 'CNAME') {
            name = record.data;
            cnames.push(name.slice(0, -1));
        } else if (record.name === name && record.type === type) {
            records.push({ content: record.data, remarks: [], buttons: [] });
        }
    }
    const remarks: Remark[] = [];
    if (dnssecLink !== undefined && records.length > 0 && !isAuthenticated(response, domain, type, true)) {
        remarks.push({
            type: 'warning',
            text: 'The response was not authenticated with DNSSEC, which poses a serious security risk.',
            link: dnssecLink,
        });
    }
    return { type, domain, cnames, remarks, records };
}

export interface RecordState {
    queries: Query[];
    error?: string | undefined;
}

export function renderRemarks(remarks: Remark[]): JSX.Element | undefined {
    if (remarks.length > 0) {
        return <ul className="fa-ul mt-2 mb-0">
            {remarks.map(remark => <li>
                <span className="fa-li">
                    <i className={'fas ' + getRemarkTypeClasses(remark.type)}></i>
                </span>
                {remark.text}
                {remark.link && <a href={remark.link}> ↗</a>}
            </li>)}
        </ul>;
    } else {
        return undefined;
    }
}

export function renderQuery(query: Query): JSX.Element {
    return <Fragment>
        <p className="mb-0">
            {query.type === undefined ?
                <Fragment>File at <code>{query.domain}</code></Fragment> :
                <Fragment><code>{query.type}</code> records of <code>{query.domain}</code></Fragment>
            }
            {query.cnames.map(cname => <Fragment>, whose <code>CNAME</code> is <code>{cname}</code></Fragment>)}:
        </p>
        {renderRemarks(query.remarks)}
        {query.records.map(record => <Fragment>
            <CodeBlock className="mt-2 mb-0" wrapped>{record.content}</CodeBlock>
            {renderRemarks(record.remarks)}
            {record.image !== undefined &&
                <img src={record.image} style={{ width: 80, height: 80, margin: 0, marginTop: '.75rem' }} title="The SVG image referenced in the 'l' tag of the record."/>
            }
            {record.buttons.length > 0 &&
                <div style={{ marginTop: '.75rem', marginLeft: '3px' }}>
                    {record.buttons.map(button => <button key={getUniqueKey()} type="button" className="btn btn-primary btn-sm mr-2" onClick={button.onClick} title={button.tooltip}>{button.label}</button>)}
                </div>
            }
        </Fragment>)}
    </Fragment>;
}

export function RawRecordOutput({ queries, error }: Readonly<RecordState>): JSX.Element | null {
    if (error) {
        return <p>An error occurred: {error}</p>;
    } else if (queries.length === 1) {
        return <div className="mb-3">{renderQuery(queries[0])}</div>;
    } else if (queries.length > 0) {
        return <ol className={queries.length > 9 ? 'long' : ''}>
            {queries.map(query => <li className="mt-3">{renderQuery(query)}</li>)}
        </ol>;
    } else {
        return null;
    }
}

export class RecordStore extends Store<RecordState> {
    public constructor() {
        super({ queries: [] });
    }

    public getNumberOfQueries(): number {
        return this.state.queries.length;
    }

    public setError(error: unknown): void {
        this.setState({ queries: [], error: getErrorMessage(error) });
    }

    /**
     * You have to call 'setState()' once you're done adding and modifying queries.
     */
    public addQuery(query: Query): void {
        this.state = { queries: [...this.state.queries, query], error: undefined };
    }

    public getRecordOutput() {
        return this.injectState<{}>(RawRecordOutput);
    }
}

/* ------------------------------ SPF record ------------------------------ */

const spfRecordStore = new RecordStore();
const SpfRecordOutput = spfRecordStore.getRecordOutput();

let limit = 11;

async function makeSpfQuery(domain: string, type: RecordType): Promise<Query> {
    if (spfRecordStore.getNumberOfQueries() >= 25) {
        throw Error('This tool aborted after 25 DNS queries to avoid getting stuck in an infinite loop. An SPF record may trigger at most 10 DNS lookups.');
    }
    const query = await makeQuery(domain, 'https://datatracker.ietf.org/doc/html/rfc7208#section-11.3', type);
    if (spfRecordStore.getNumberOfQueries() >= limit) {
        query.remarks.push({
            type: 'error',
            text: 'An SPF record may trigger at most 10 DNS lookups.',
            link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-4.6.4',
        });
    }
    if (type !== 'TXT' && query.records.length === 0) {
        query.remarks.push({
            type: 'warning',
            text: 'Void lookups, which return no DNS records, are allowed but should be limited to two.',
            link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-4.6.4',
        });
    }
    return query;
}

async function checkARecord(domain: string): Promise<void> {
    const query = await makeSpfQuery(domain, 'A');
    spfRecordStore.addQuery(query);
}

async function checkMxRecord(domain: string): Promise<void> {
    const query = await makeSpfQuery(domain, 'MX');
    spfRecordStore.addQuery(query);
    for (const record of query.records) {
        if (/^\d+ ([a-z0-9_]([-a-z0-9]{0,61}[a-z0-9])?\.)+[a-z][-a-z0-9]{0,61}[a-z0-9]\.$/i.test(record.content)) {
            await checkARecord(record.content.split(' ')[1].slice(0, -1));
        } else {
            record.remarks.push({
                type: 'error',
                text: 'This tool could not parse this MX record.',
            });
        }
    }
}

const qualifiers = ['+', '-', '?', '~'] as const;
type Qualifier = typeof qualifiers[number];

const mechanisms = ['all', 'include', 'a', 'mx', 'ptr', 'ip4', 'ip6', 'exists'] as const;
type Mechanism = typeof mechanisms[number];

interface Directive {
    qualifier: Qualifier;
    mechanism: Mechanism;
    address?: string | undefined;
}

interface Modifier {
    name: string;
    value: string;
}

const knownModifiers = ['redirect', 'exp'];

const spfDomainRegex = /^([a-z0-9_]([-a-z0-9]{0,61}[a-z0-9])?\.)+[a-z][-a-z0-9]{0,61}[a-z0-9]$/i;
const ip4CidrRegex = /^\/(0|[1-9][0-9]{0,1})?$/;
const ip6CidrRegex = /^\/(0|[1-9][0-9]{0,2})?$/;
const dualCidrRegex = /^(\/|(\/(0|[1-9][0-9]{0,1}))?(\/\/(0|[1-9][0-9]{0,2}))?)$/;

async function checkSpfRecord(domain: string, include: boolean = false): Promise<void> {
    if (spfRecordStore.getNumberOfQueries() === 0) {
        const query = await makeSpfQuery(domain, 'SPF');
        if (query.records.length > 0) {
            query.remarks.push({
                type: 'warning',
                text: 'The SPF record type has been deprecated. Use a TXT record instead.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-3.1',
            });
            spfRecordStore.addQuery(query);
            limit++;
        }
    }
    const query = await makeSpfQuery(domain, 'TXT');
    spfRecordStore.addQuery(query);
    const records = query.records.filter(record => record.content.startsWith('v=spf1 ') || record.content === 'v=spf1');
    if (records.length === 0) {
        if (include) {
            query.remarks.push({
                type: 'error',
                text: 'An inexistent SPF record results in a permanent error.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-5.2',
            });
        } else {
            query.remarks.push({
                type: 'warning',
                text: 'No SPF record has been published for this domain. All domains should have an SPF record.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-4.5',
            });
        }
    } else if (records.length > 1) {
        query.remarks.push({
            type: 'error',
            text: 'A domain may not have multiple TXT records which start with "v=spf1".',
            link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-3.2',
        });
    } else {
        const record = records[0];
        const content = record.content.trim();
        const lowercaseContent = content.toLowerCase();
        if (lowercaseContent !== content) {
            record.remarks.push({
                type: 'info',
                text: 'SPF records are case-insensitive, but they are usually published in lowercase.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-12',
            });
        }
        if (lowercaseContent.includes('  ')) {
            record.remarks.push({
                type: 'info',
                text: 'The terms can be separated by multiple spaces, but there is no reason to do so.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-12',
            });
        }
        const terms = lowercaseContent.split(/ +/);
        const directives: Directive[] = [];
        const modifiers: Modifier[] = [];
        let wrongOrder = false;
        let knownModifier = false;
        for (let i = 1; i < terms.length; i++) {
            let term = terms[i];
            if (/^[a-z][a-z0-9_.-]*=/.test(term)) {
                const index = term.indexOf('=');
                const modifier: Modifier = {
                    name: term.substring(0, index),
                    value: term.substring(index + 1),
                }
                modifiers.push(modifier);
                if (knownModifiers.includes(modifier.name)) {
                    knownModifier = true;
                } else {
                    record.remarks.push({
                        type: 'warning',
                        text: `This tool doesn't know the modifier "${modifier.name}" and therefore cannot check its validity.`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-6',
                    });
                }
            } else {
                if (knownModifier) {
                    wrongOrder = true;
                }
                const explicitQualifier = qualifiers.includes(term.charAt(0) as Qualifier);
                const qualifier: Qualifier = explicitQualifier ? term.charAt(0) as Qualifier : '+';
                if (explicitQualifier) {
                    term = term.substring(1);
                }
                let index1 = term.indexOf(':');
                let index2 = index1 + 1;
                if (index1 === -1) {
                    index1 = term.indexOf('/');
                    index2 = index1;
                }
                const mechanism = (index1 > 0 ? term.substring(0, index1) : term) as Mechanism;
                if (mechanisms.includes(mechanism)) {
                    directives.push({
                        qualifier,
                        mechanism,
                        address: index2 > 0 ? term.substring(index2) : undefined,
                    });
                } else {
                    record.remarks.push({
                        type: 'error',
                        text: `There is no mechanism with the name "${mechanism}".`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-5',
                    });
                }
            }
        }
        if (wrongOrder) {
            record.remarks.push({
                type: 'warning',
                text: 'The "redirect" and "exp" modifiers should appear at the end of the record after all mechanisms.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-6',
            });
        }
        const explanations = modifiers.filter(modifier => modifier.name === 'exp');
        if (explanations.length > 1) {
            record.remarks.push({
                type: 'error',
                text: 'The "exp" modifier may appear at most once in a record.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-6',
            });
        }
        if (explanations.length > 0) {
            record.remarks.push({
                type: 'info',
                text: 'This tool does not validate the "exp" modifier.',
            });
        }
        const redirects = modifiers.filter(modifier => modifier.name === 'redirect');
        if (redirects.length > 1) {
            record.remarks.push({
                type: 'error',
                text: 'The "redirect" modifier may appear at most once in a record.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-6',
            });
        }
        let nonPassQualifierInInclude = false;
        let nonIpMechanismEncountered = false;
        let informAboutIpMechanismOrder = false;
        let warnedAboutDirectivesAfterAll = false;
        let warnedAboutIgnoredRedirectModifier = false;
        for (let i = 0; i < directives.length; i++) {
            const directive = directives[i];
            if (directive.mechanism === 'all') {
                if (i !== directives.length - 1 && !warnedAboutDirectivesAfterAll) {
                    warnedAboutDirectivesAfterAll = true;
                    record.remarks.push({
                        type: 'warning',
                        text: 'All directives after "all" are ignored.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-5.1',
                    });
                }
                if (redirects.length > 0 && !warnedAboutIgnoredRedirectModifier) {
                    warnedAboutIgnoredRedirectModifier = true;
                    record.remarks.push({
                        type: 'warning',
                        text: 'The "redirect" modifier is ignored when there is an "all" directive in the record.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-5.1',
                    });
                }
                if (directive.qualifier === '+') {
                    record.remarks.push({
                        type: 'warning',
                        text: `The "all" modifier should never cause the evaluation to pass. You don't want to allow anyone to send messages on behalf of the domain. Since spammers use this to send emails from botnets, your domain might even be penalized.`,
                    });
                } else if (directive.qualifier === '?') {
                    record.remarks.push({
                        type: 'warning',
                        text: 'Unless you are still testing, the "all" modifier should cause the evaluation to (soft-)fail.',
                    });
                    if (include) {
                        record.remarks.push({
                            type: 'warning',
                            text: `Since emails can be sent from any domain, the previous warning is also relevant for included SPF records. If the DMARC policy for this domain is "none" or inexistent, a fraudster might be able to send emails from "@${domain}".`,
                        });
                    }
                }
            } else {
                if (include) {
                    if (directive.qualifier === '+') {
                        nonPassQualifierInInclude = false;
                    } else {
                        nonPassQualifierInInclude = true;
                    }
                }
                if (directive.mechanism !== 'ip4' && directive.mechanism !== 'ip6') {
                    nonIpMechanismEncountered = true;
                } else if (nonIpMechanismEncountered) {
                    informAboutIpMechanismOrder = true;
                }
            }
        }
        if (nonPassQualifierInInclude) {
            record.remarks.push({
                type: 'warning',
                text: 'In an included SPF record, qualifiers other than "+" have an effect only if they are followed by a directive with an (implicit) "+". Unless this record is also used directly or through the "redirect" modifier, this is likely a mistake.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-5.2',
            });
        }
        if (informAboutIpMechanismOrder) {
            record.remarks.push({
                type: 'info',
                text: 'The "ip4" and "ip6" mechanisms should be listed first because they can be evaluated without triggering additional lookups, which improves performance. (The order of the mechanisms matters only in rare cases with mixed qualifiers.)',
            });
        }
        if (directives.filter(directive => directive.mechanism === 'all').length === 0 && redirects.length === 0) {
            record.remarks.push({
                type: 'warning',
                text: 'It is recommended to use the "all" mechanism or the "redirect" modifier to provide an explicit default. The implicit default is "neutral".',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-4.7',
            });
        }
        let hasMacro = false;
        for (const directive of directives) {
            if (directive.mechanism === 'include') {
                if (directive.address === undefined) {
                    record.remarks.push({
                        type: 'error',
                        text: 'Each "include" mechanism must be followed by a domain or macro.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-5.2',
                    });
                } else if (directive.address.includes('%')) {
                    hasMacro = true;
                } else if (spfDomainRegex.test(directive.address)) {
                    await checkSpfRecord(directive.address, true);
                } else {
                    record.remarks.push({
                        type: 'warning',
                        text: 'This tool could not parse the "include" domain.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-12',
                    });
                }
            } else if (directive.mechanism === 'a') {
                if (directive.address === undefined) {
                    await checkARecord(domain);
                } else if (directive.address.includes('%')) {
                    hasMacro = true;
                } else {
                    const [target, cidr] = splitOnFirstOccurrence(directive.address, '/');
                    if (target === '') {
                        await checkARecord(domain);
                    } else if (spfDomainRegex.test(target)) {
                        await checkARecord(target);
                    } else {
                        record.remarks.push({
                            type: 'warning',
                            text: 'This tool could not parse the "a" domain.',
                            link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-12',
                        });
                    }
                    if (!dualCidrRegex.test(cidr)) {
                        record.remarks.push({
                            type: 'error',
                            text: 'The "a" directive has an invalid CIDR suffix.',
                            link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-12',
                        });
                    }
                }
            } else if (directive.mechanism === 'mx') {
                if (directive.address === undefined) {
                    await checkMxRecord(domain);
                } else if (directive.address.includes('%')) {
                    hasMacro = true;
                } else {
                    const [target, cidr] = splitOnFirstOccurrence(directive.address, '/');
                    if (target === '') {
                        await checkMxRecord(domain);
                    } else if (spfDomainRegex.test(target)) {
                        await checkMxRecord(target);
                    } else {
                        record.remarks.push({
                            type: 'warning',
                            text: 'This tool could not parse the "mx" domain.',
                            link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-12',
                        });
                    }
                    if (!dualCidrRegex.test(cidr)) {
                        record.remarks.push({
                            type: 'error',
                            text: 'The "mx" directive has an invalid CIDR suffix.',
                            link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-12',
                        });
                    }
                }
            } else if (directive.mechanism === 'ip4') {
                const [address, cidr] = splitOnFirstOccurrence(directive.address ?? '', '/');
                if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(address)) {
                    record.remarks.push({
                        type: 'error',
                        text: 'This tool could not parse the "ip4" address.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-5.6',
                    });
                }
                if (!ip4CidrRegex.test(cidr)) {
                    record.remarks.push({
                        type: 'error',
                        text: 'The "ip4" directive has an invalid CIDR suffix.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-12',
                    });
                }
            } else if (directive.mechanism === 'ip6') {
                const [address, cidr] = splitOnFirstOccurrence(directive.address ?? '', '/');
                if (!/^[a-f0-9:]+$/.test(address)) {
                    record.remarks.push({
                        type: 'error',
                        text: 'This tool could not parse the "ip6" address.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-5.6',
                    });
                }
                if (!ip6CidrRegex.test(cidr)) {
                    record.remarks.push({
                        type: 'error',
                        text: 'The "ip6" directive has an invalid CIDR suffix.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-12',
                    });
                }
            }
        }
        if (directives.filter(directive => directive.mechanism === 'ptr').length > 0) {
            record.remarks.push({
                type: 'info',
                text: 'This tool cannot evaluate "ptr" directives. You have to validate them differently.',
            });
            record.remarks.push({
                type: 'warning',
                text: 'Use of the "ptr" mechanism is discouraged.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-5.5',
            });
        }
        if (directives.filter(directive => directive.mechanism === 'exists').length > 0) {
            record.remarks.push({
                type: 'info',
                text: 'This tool does not evaluate "exists" directives because they only make sense with macros.',
            });
        }
        for (const redirect of redirects) {
            if (redirect.value.includes('%')) {
                hasMacro = true;
            } else if (spfDomainRegex.test(redirect.value)) {
                await checkSpfRecord(redirect.value);
            } else {
                record.remarks.push({
                    type: 'warning',
                    text: 'This tool could not parse the "redirect" domain.',
                    link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-6.1',
                });
            }
        }
        if (hasMacro) {
            record.remarks.push({
                type: 'info',
                text: 'This tool cannot evaluate macros. You have to validate them differently.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7208#section-7',
            });
        }
    }
}

async function querySpfRecord({ domain }: State): Promise<void> {
    spfRecordStore.setState({ queries: [], error: undefined });
    limit = 11;
    try {
        await checkSpfRecord(domain.toLowerCase());
        spfRecordStore.setState();
    } catch (error) {
        spfRecordStore.setError(error);
    }
}

/* ------------------------------ DKIM record ------------------------------ */

const dkimRecordStore = new RecordStore();
const DkimRecordOutput = dkimRecordStore.getRecordOutput();

interface Tag {
    name: string;
    value: string;
}

// https://www.iana.org/assignments/dkim-parameters/dkim-parameters.xhtml#dkim-parameters-5
const dkimTagNames = ['v', 'h', 'k', 'n', 'p', 's', 't'] as const;
type DkimTagName = typeof dkimTagNames[number];

async function loadDkimRecord({ domain, dkimSelector }: State): Promise<void> {
    domain = domain.toLowerCase();
    dkimRecordStore.resetState();
    try {
        const dkimDomain = dkimSelector + '._domainkey.' + domain;
        const query = await makeQuery(dkimDomain, 'https://datatracker.ietf.org/doc/html/rfc6376#section-8.5');
        dkimRecordStore.addQuery(query);
        if (query.records.length === 0) {
            query.remarks.push({
                type: 'error',
                text: 'Could not find a DKIM record with the given selector at the given domain.',
            });
        } else if (query.records.length > 1) {
            query.remarks.push({
                type: 'error',
                text: 'There may be only one DKIM record for a given selector at a given domain.',
                link: 'https://datatracker.ietf.org/doc/html/rfc6376#section-3.6.2.2',
            });
        } else {
            const state = getDefaultDkimState();
            const record = query.records[0];
            if (!/^v[ \t]*=[ \t]*DKIM1[ \t]*(;.*)?$/.test(record.content)) {
                record.remarks.push({
                    type: 'info',
                    text: 'It is recommended but not mandatory to provide the version of the DKIM record.',
                    link: 'https://datatracker.ietf.org/doc/html/rfc6376#section-3.6.1',
                });
            }
            const tags: Tag[] = [];
            for (const tag of record.content.split(';')) {
                const index = tag.indexOf('=');
                if (index > 0) {
                    const name = tag.substring(0, index).trim();
                    const value = tag.substring(index + 1).trim();
                    if (dkimTagNames.includes(name as any)) {
                        tags.push({ name, value });
                    } else {
                        record.remarks.push({
                            type: 'warning',
                            text: `This tool doesn't know the tag name "${name}".`,
                            link: 'https://datatracker.ietf.org/doc/html/rfc6376#section-3.6.1',
                        });
                    }
                } else if (tag.trim().length > 0) {
                    record.remarks.push({
                        type: 'error',
                        text: `"${tag.trim()}" is not a valid tag.`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc6376#section-3.2',
                    });
                }
            }

            function getTag(name: DkimTagName): Tag | undefined {
                const filteredTags = tags.filter(tag => tag.name === name);
                if (filteredTags.length > 1) {
                    record.remarks.push({
                        type: 'error',
                        text: `There may be only one tag with the name "${name}".`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc6376#section-3.2',
                    });
                }
                return filteredTags.length > 0 ? filteredTags[0] : undefined;
            }

            function isOneOf(values: string[], tag: Tag | undefined): string | undefined {
                if (tag !== undefined && !values.includes(tag.value)) {
                    record.remarks.push({
                        type: 'warning',
                        text: `This tool doesn't know the value "${tag.value}" for the tag "${tag.name}".`,
                        link: 'https://www.iana.org/assignments/dkim-parameters/dkim-parameters.xhtml',
                    });
                    return undefined;
                } else {
                    return tag?.value;
                }
            }

            function isSomeOf(values: string[], tag: Tag | undefined): string[] | undefined {
                if (tag !== undefined) {
                    const result: string[] = [];
                    for (const value of tag.value.split(':').map(value => value.trim())) {
                        if (values.includes(value)) {
                            result.push(value);
                        } else {
                            record.remarks.push({
                                type: 'warning',
                                text: `This tool doesn't know the value "${value}" for the tag "${tag.name}".`,
                                link: 'https://www.iana.org/assignments/dkim-parameters/dkim-parameters.xhtml',
                            });
                        }
                    }
                    return result;
                } else {
                    return undefined;
                }
            }

            function setState(field: keyof DkimState, value: BasicValue | undefined): void {
                if (value !== undefined) {
                    // @ts-ignore
                    state[field] = value;
                }
            }

            // Check that there is only one "v" tag.
            getTag('v');

            setState('keyType', isOneOf(['rsa', 'ed25519'], getTag('k')));

            const pTag = getTag('p');
            if (pTag !== undefined) {
                if (/^[\sa-zA-Z0-9+/]*(=\s*){0,2}$/.test(pTag.value)) {
                    state.publicKey = pTag.value;
                } else {
                    record.remarks.push({
                        type: 'error',
                        text: `The value of the "p" tag has to be Base64 encoded.`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc6376#section-3.6.1',
                    });
                }
            } else {
                record.remarks.push({
                    type: 'error',
                    text: `This DKIM1 record doesn't have the required "p" tag.`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc6376#section-3.6.1',
                });
            }

            const hTag = getTag('h');
            if (hTag !== undefined) {
                if (hTag.value.includes(':')) {
                    record.remarks.push({
                        type: 'warning',
                        text: `This tool supports only a single value in the "h" tag.`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc6376#section-3.6.1',
                    });
                } else {
                    setState('hashAlgorithms', isOneOf(['sha256'], hTag));
                }
            }

            const sTag = getTag('s');
            if (sTag !== undefined) {
                if (sTag.value.includes(':')) {
                    record.remarks.push({
                        type: 'warning',
                        text: `This tool supports only a single value in the "s" tag.`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc6376#section-3.6.1',
                    });
                } else {
                    setState('serviceTypes', isOneOf(['*', 'email'], sTag));
                }
            }

            setState('flags', isSomeOf(['y', 's'], getTag('t')));

            setDkimState(state);
        }
        dkimRecordStore.setState();
    } catch (error) {
        dkimRecordStore.setError(error);
    }
}

/* ------------------------------ DMARC record ------------------------------ */

const dmarcRecordStore = new RecordStore();
const DmarcRecordOutput = dmarcRecordStore.getRecordOutput();

async function getOrganizationalDomain(domain: string): Promise<string> {
    const response = await resolveDomainName(domain, 'SOA', false);
    if (response.answer.filter(record => record.type === 'CNAME').length > 0) {
        return await getOrganizationalDomain(domain.substring(domain.indexOf('.') + 1));
    } else {
        const records = getAllRecords(response, 'SOA');
        if (records.length === 1) {
            return records[0].name.slice(0, -1);
        } else {
            throw Error(`Could not find a "SOA" record for "${domain}".`);
        }
    }
}

// https://www.iana.org/assignments/dmarc-parameters/dmarc-parameters.xhtml#tag
const dmarcTagNames = ['adkim', 'aspf', 'fo', 'p', 'pct', 'rf', 'ri', 'rua', 'ruf', 'sp', 'v'] as const;
type DmarcTagName = typeof dmarcTagNames[number];

function parseReportSize(text: string): string {
    const size = text.substring(0, text.length - 1);
    const unit = text.substring(text.length - 1);
    const plural = size !== '1' ? 's' : '';
    switch (unit) {
        case 'k':
            return size + ' kibibyte' + plural;
        case 'm':
            return size + ' mebibyte' + plural;
        case 'g':
            return size + ' gibibyte' + plural;
        case 't':
            return size + ' tebibyte' + plural;
        default:
            return text + ' bytes';
    }
}

async function makeDmarcQuery(domain: string): Promise<[Query, Record[]]> {
    if (dmarcRecordStore.getNumberOfQueries() >= 10) {
        throw Error('This tool aborted after 10 DMARC queries. Something is not as it should be.');
    }
    const query = await makeQuery(domain, 'https://datatracker.ietf.org/doc/html/rfc7489#section-12.3');
    dmarcRecordStore.addQuery(query);
    const records = query.records.filter(record => /^v[ \t]*=[ \t]*DMARC1[ \t]*(;.*)?$/.test(record.content));
    return [query, records];
}

async function checkDmarcRecord(domain: string): Promise<void> {
    const dmarcDomain = '_dmarc.' + domain;
    const [query, records] = await makeDmarcQuery(dmarcDomain);
    const organizationalDomain = await getOrganizationalDomain(domain);
    if (records.length === 0) {
        if (domain === organizationalDomain) {
            query.remarks.push({
                type: 'error',
                text: 'Could not find a DMARC1 record at the given domain.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.6.3',
            });
        } else {
            query.remarks.push({
                type: 'info',
                text: 'Could not find a DMARC1 record at the given subdomain. Will query the organizational domain next.',
                link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.6.3',
            });
            await checkDmarcRecord(organizationalDomain);
        }
    } else if (records.length > 1) {
        query.remarks.push({
            type: 'error',
            text: 'There may be only one DMARC1 record at a given domain.',
            link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.6.3',
        });
    } else {
        const state = getDefaultDmarcState();
        const record = records[0];
        const tags: Tag[] = [];
        for (const tag of record.content.split(';')) {
            const parts = tag.split('=').map(part => part.trim());
            if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
                const name = parts[0];
                if (dmarcTagNames.includes(name as any)) {
                    tags.push({ name, value: parts[1] });
                } else {
                    record.remarks.push({
                        type: 'warning',
                        text: `This tool doesn't know the tag name "${name}".`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
                    });
                }
            } else if (parts.length > 1 || parts[0].length !== 0) { // Exclude empty tags.
                record.remarks.push({
                    type: 'error',
                    text: `"${parts.join('=')}" is not a valid tag.`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.4',
                });
            }
        }

        function getTag(name: DmarcTagName): Tag | undefined {
            const filteredTags = tags.filter(tag => tag.name === name);
            if (filteredTags.length > 1) {
                record.remarks.push({
                    type: 'error',
                    text: `There may be only one tag with the name "${name}".`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.4',
                });
            }
            return filteredTags.length > 0 ? filteredTags[0] : undefined;
        }

        function isOneOf(values: string[], tag: Tag | undefined): string | undefined {
            if (tag !== undefined && !values.includes(tag.value)) {
                record.remarks.push({
                    type: 'error',
                    text: `"${tag.value}" is not a valid value for "${tag.name}".`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
                });
                return undefined;
            } else {
                return tag?.value;
            }
        }

        function isSomeOf(values: string[], tag: Tag | undefined): string[] | undefined {
            if (tag !== undefined) {
                const result: string[] = [];
                for (const value of tag.value.split(':').map(value => value.trim())) {
                    if (values.includes(value)) {
                        result.push(value);
                    } else {
                        record.remarks.push({
                            type: 'error',
                            text: `"${value}" is not a valid value for "${tag.name}".`,
                            link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.4',
                        });
                    }
                }
                return result.length > 0 ? result : undefined;
            } else {
                return undefined;
            }
        }

        async function checkAddresses(tag: Tag | undefined): Promise<string | undefined> {
            if (tag !== undefined) {
                const result: string[] = [];
                const addresses = tag.value.split(',').map(address => address.trim());
                for (const address of addresses) {
                    if (address.startsWith('mailto:')) {
                        const substring = address.substring(7).replace(/%21/g, '!');
                        if (dmarcAddressRegex.test(substring)) {
                            result.push(substring);
                            const parts = substring.split('@');
                            const splits = parts[1].split('!');
                            if (splits.length > 1) {
                                record.remarks.push({
                                    type: 'info',
                                    text: `Only reports smaller than ${parseReportSize(splits[1])} shall be sent to "${parts[0]}@${splits[0]}".`,
                                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.2',
                                });
                            }
                            const destinationDomain = splits[0];
                            const destinationDmarcDomain = domain + '._report._dmarc.' + destinationDomain;
                            if (dmarcRecordStore.getState().queries.filter(query => query.domain === destinationDmarcDomain).length === 0) {
                                const destinationOrganizationalDomain = await getOrganizationalDomain(destinationDomain);
                                if (destinationOrganizationalDomain !== organizationalDomain) {
                                    const [approvalQuery, approvalRecords] = await makeDmarcQuery(destinationDmarcDomain);
                                    if (approvalRecords.length === 0) {
                                        approvalQuery.remarks.push({
                                            type: 'error',
                                            text: `The destination domain "${destinationDomain}" didn't approve to receive reports for "${domain}".`,
                                            link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-7.1',
                                        });
                                    } else if (approvalRecords.length > 1) {
                                        approvalQuery.remarks.push({
                                            type: 'error',
                                            text: 'There may be only one DMARC1 record at a given domain.',
                                            link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.6.3',
                                        });
                                    } else if (/^v[ \t]*=[ \t]*DMARC1[ \t]*$/.test(approvalRecords[0].content)) {
                                        approvalRecords[0].remarks.push({
                                            type: 'warning',
                                            text: 'The version tag of the approval record should end with a semicolon.',
                                            link: 'https://www.rfc-editor.org/errata/eid5440',
                                        });
                                    }
                                }
                            }
                        } else {
                            record.remarks.push({
                                type: 'error',
                                text: `This tool doesn't recognize "${substring}" as an email address.`,
                                link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.2',
                            });
                        }
                    } else {
                        record.remarks.push({
                            type: 'warning',
                            text: `"${address}" does not start with "mailto:".`,
                            link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.2',
                        });
                    }
                }
                return result.join(', ');
            } else {
                return undefined;
            }
        }

        function setState(field: keyof DmarcState, value: BasicValue | undefined): void {
            if (value !== undefined) {
                // @ts-ignore
                state[field] = value;
            }
        }

        // Check that there is only one "v" tag.
        getTag('v');

        const policies = ['none', 'quarantine', 'reject'];

        const pTag = getTag('p');
        setState('domainPolicy', isOneOf(policies, pTag));
        if (pTag === undefined) {
            record.remarks.push({
                type: 'error',
                text: `A domain policy "p" is required for policy records.`,
                link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
            });
        } else if (pTag.value === 'none') {
            record.remarks.push({
                type: 'warning',
                text: `The domain policy "p" should be "none" only if you still need to collect feedback during early rollout.`,
                link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.7',
            });
        }

        const spTag = getTag('sp');
        setState('subdomainPolicy', isOneOf(policies, spTag));
        if (spTag !== undefined) {
            if (domain !== organizationalDomain) {
                record.remarks.push({
                    type: 'warning',
                    text: `The subdomain policy "sp" has an effect only when specified on the organizational domain "${organizationalDomain}".`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.6.3',
                });
            }
            if (spTag.value === 'none') {
                record.remarks.push({
                    type: 'warning',
                    text: `The subdomain policy "sp" should be "none" only if you still need to collect feedback during early rollout.`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.7',
                });
            }
            if (pTag !== undefined) {
                if (spTag.value === pTag.value) {
                    record.remarks.push({
                        type: 'info',
                        text: `If the subdomain policy "sp" is the same as the domain policy "p", it doesn't have to be provided.`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
                    });
                } else if (pTag.value === 'reject' && spTag.value !== 'reject' || pTag.value === 'quarantine' && spTag.value === 'none') {
                    record.remarks.push({
                        type: 'warning',
                        text: `The subdomain policy "sp" should be at least as strict as the domain policy "p". Otherwise, the domain policy can be circumvented by using a subdomain in the "From" address.`,
                    });
                }
            }
        }

        const pctTag = getTag('pct');
        if (pctTag !== undefined) {
            if (/^\d+$/.test(pctTag.value)) {
                const value = parseInt(pctTag.value, 10);
                if (value >= 0 && value <= 100) {
                    state.rolloutPercentage = value;
                } else {
                    record.remarks.push({
                        type: 'error',
                        text: `The rollout percentage "pct" has to be between 0 and 100.`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
                    });
                }
            } else {
                record.remarks.push({
                    type: 'error',
                    text: `The rollout percentage "pct" has to be an integer.`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
                });
            }
        }

        const alignments = ['r', 's'];
        setState('spfAlignment', isOneOf(alignments, getTag('aspf')));
        setState('dkimAlignment', isOneOf(alignments, getTag('adkim')));
        setState('aggregateReports', await checkAddresses(getTag('rua')));

        const riTag = getTag('ri');
        if (riTag !== undefined) {
            if (/^\d+$/.test(riTag.value)) {
                const value = parseInt(riTag.value, 10);
                if (value >= 3600) {
                    state.reportInterval = Math.round(value / 3600);
                } else {
                    record.remarks.push({
                        type: 'warning',
                        text: `The receiving domain might not support issuing reports more frequently than hourly.`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
                    });
                }
            } else {
                record.remarks.push({
                    type: 'error',
                    text: `The report interval "ri" has to be an integer.`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
                });
            }
        }

        setState('failureReports', await checkAddresses(getTag('ruf')));
        setState('reportFormat', isSomeOf(['afrf'], getTag('rf')));
        setState('reportOptions', isSomeOf(['0', '1', 'd', 's'], getTag('fo')));

        function hasTag(name: DmarcTagName): boolean {
            return tags.filter(tag => tag.name === name).length > 0;
        }

        if (!hasTag('rua') && hasTag('ri')) {
            record.remarks.push({
                type: 'warning',
                text: `The report interval "ri" has no effect without aggregate report recipients in "rua".`,
                link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
            });
        }
        if (!hasTag('ruf')) {
            if (hasTag('rf')) {
                record.remarks.push({
                    type: 'warning',
                    text: `The report format "rf" has no effect without failure report recipients in "ruf".`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
                });
            }
            if (hasTag('fo')) {
                record.remarks.push({
                    type: 'warning',
                    text: `The report options "fo" has no effect without failure report recipients in "ruf".`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc7489#section-6.3',
                });
            }
        }

        setDmarcState(state);
    }
}

async function loadDmarcRecord({ domain }: State): Promise<void> {
    dmarcRecordStore.resetState();
    try {
        await checkDmarcRecord(domain.toLowerCase());
        dmarcRecordStore.setState();
    } catch (error) {
        dmarcRecordStore.setError(error);
    }
}

/* ------------------------------ BIMI record ------------------------------ */

const bimiRecordStore = new RecordStore();
const BimiRecordOutput = bimiRecordStore.getRecordOutput();

// https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-4.2
const bimiTagNames = ['v', 'l', 'a'] as const;
type BimiTagName = typeof bimiTagNames[number];

async function checkBimiRecord(domain: string, bimiSelector: string): Promise<void> {
    const bimiDomain = bimiSelector + '._bimi.' + domain;
    const query = await makeQuery(bimiDomain);
    bimiRecordStore.addQuery(query);
    if (query.records.length === 0) {
        const organizationalDomain = await getOrganizationalDomain(domain);
        if (domain === organizationalDomain) {
            query.remarks.push({
                type: 'error',
                text: 'Could not find a BIMI record with the given selector at the given domain.',
                link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-7.2',
            });
        } else {
            query.remarks.push({
                type: 'info',
                text: 'Could not find a BIMI record at the given subdomain. Will query the organizational domain next.',
                link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-7.2',
            });
            await checkBimiRecord(organizationalDomain, bimiSelector);
        }
    } else if (query.records.length > 1) {
        query.remarks.push({
            type: 'error',
            text: 'There may be only one BIMI record for a given selector at a given domain.',
            link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-7.2',
        });
    } else {
        const record = query.records[0];
        if (!/^v[ \t]*=[ \t]*BIMI\d[ \t]*(;.*)?$/.test(record.content)) {
            record.remarks.push({
                type: 'error',
                text: 'This BIMI record does not start with a valid "v" tag.',
                link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-4.2',
            });
        }
        const tags: Tag[] = [];
        for (const tag of record.content.split(';')) {
            const index = tag.indexOf('=');
            if (index > 0) {
                const name = tag.substring(0, index).trim();
                const value = tag.substring(index + 1).trim();
                if (bimiTagNames.includes(name as any)) {
                    tags.push({ name, value });
                } else {
                    record.remarks.push({
                        type: 'warning',
                        text: `This tool doesn't know the tag name "${name}".`,
                        link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-4.2',
                    });
                }
            } else if (tag.trim().length > 0) {
                record.remarks.push({
                    type: 'error',
                    text: `"${tag.trim()}" is not a valid tag.`,
                    link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-4.2',
                });
            }
        }

        function getTag(name: BimiTagName): Tag | undefined {
            const filteredTags = tags.filter(tag => tag.name === name);
            if (filteredTags.length > 1) {
                record.remarks.push({
                    type: 'error',
                    text: `There may be only one tag with the name "${name}".`,
                    link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-4.2',
                });
            }
            return filteredTags.length > 0 ? filteredTags[0] : undefined;
        }

        // Check that there is only one "v" tag.
        getTag('v');

        const lTag = getTag('l');
        if (lTag !== undefined) {
            if (/^https:\/\/[^,]+$/.test(lTag.value)) {
                record.image = lTag.value;
                if (!lTag.value.endsWith('.svg')) {
                    record.remarks.push({
                        type: 'warning',
                        text: 'The value of the "l" tag usually ends with ".svg".',
                    });
                }
            } else if (lTag.value !== '') {
                record.remarks.push({
                    type: 'error',
                    text: 'The value of the "l" tag has to start with "https://".',
                    link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-4.2',
                });
            }
        }

        const aTag = getTag('a');
        if (aTag !== undefined) {
            if (/^https:\/\/[^,]+$/.test(aTag.value)) {
                if (!aTag.value.endsWith('.pem')) {
                    record.remarks.push({
                        type: 'warning',
                        text: 'The value of the "a" tag should end with ".pem".',
                        link: 'https://datatracker.ietf.org/doc/html/draft-fetch-validation-vmc-wchuang-00#section-3.3',
                    });
                }
                record.remarks.push({
                    type: 'info',
                    text: 'This tool does not validate the certificate.',
                });
                record.buttons.push({
                    label: 'Download the certificate',
                    tooltip: 'Opens the address of the "a" tag in a new window.',
                    onClick: () => window.open(aTag.value),
                });
            } else if (aTag.value !== '') {
                record.remarks.push({
                    type: 'error',
                    text: 'The value of the "a" tag has to start with "https://".',
                    link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-4.2',
                });
            }
        } else {
            if (lTag !== undefined) {
                record.remarks.push({
                    type: 'warning',
                    text: `Mail clients won't display the icon without a valid certificate.`,
                    link: 'https://datatracker.ietf.org/doc/html/draft-blank-ietf-bimi-02#section-4.2',
                });
            }
        }
    }
}

async function queryBimiRecord({ domain, bimiSelector }: State): Promise<void> {
    bimiRecordStore.resetState();
    try {
        await checkBimiRecord(domain.toLowerCase(), bimiSelector);
        bimiRecordStore.setState();
    } catch (error) {
        bimiRecordStore.setError(error);
    }
}

/* ------------------------------ TLSA records ------------------------------ */

const tlsaRecordsStore = new RecordStore();
const TlsaRecordsOutput = tlsaRecordsStore.getRecordOutput();

async function queryTlsaRecords({ domain }: State): Promise<void> {
    domain = domain.toLowerCase();
    tlsaRecordsStore.resetState();
    try {
        const mxQuery = await makeQuery(domain, 'https://datatracker.ietf.org/doc/html/rfc6698#section-1.3', 'MX');
        if (mxQuery.records.length === 0) {
            mxQuery.remarks.push({
                type: 'info',
                text: 'This domain has no MX records.',
            });
        }
        tlsaRecordsStore.addQuery(mxQuery);
        for (const mxRecord of mxQuery.records) {
            const parts = mxRecord.content.split(' ');
            if (parts.length !== 2) {
                mxRecord.remarks.push({
                    type: 'error',
                    text: 'Could not parse this MX record.',
                });
            } else {
                const mxDomain = parts[1].slice(0, -1);
                if (mxDomain !== '') {
                    const tlsaQuery = await makeQuery('_25._tcp.' + mxDomain, 'https://datatracker.ietf.org/doc/html/rfc6698#section-1.3', 'TLSA');
                    tlsaRecordsStore.addQuery(tlsaQuery);
                    if (tlsaQuery.records.length === 0) {
                        tlsaQuery.remarks.push({
                            type: 'warning',
                            text: 'This mail server has no TLSA records.',
                        });
                    } else {
                        let allValid = true;
                        for (const tlsaRecord of tlsaQuery.records) {
                            if (!/^(2|3) (0|1) (1 [0-9A-Fa-f]{64}|2 [0-9A-Fa-f]{128})$/.test(tlsaRecord.content)) {
                                allValid = false;
                                tlsaRecord.remarks.push({
                                    type: 'warning',
                                    text: 'This TLSA record did not match the usual format.',
                                    link: 'https://datatracker.ietf.org/doc/html/rfc7672#section-3.1',
                                });
                            }
                        }
                        if (allValid) {
                            getLastElement(tlsaQuery.records).buttons.push({
                                label: 'Copy the OpenSSL command',
                                tooltip: 'Copy the OpenSSL command with the DANE constraint to your clipboard.',
                                onClick: () => copyToClipboard(`${getOpenSslCommand()} s_client -starttls smtp -connect ${mxDomain}:25 -verify_return_error -dane_tlsa_domain "${mxDomain}" ${tlsaQuery.records.map(record => `-dane_tlsa_rrdata "${record.content}"`).join(' ')}`),
                            });
                        }
                    }
                }
            }
        }
        tlsaRecordsStore.setState();
    } catch (error) {
        tlsaRecordsStore.setError(error);
    }
}

/* ------------------------------ MTA-STS file ------------------------------ */

const mtaStsFileStore = new RecordStore();
const MtaStsFileOutput = mtaStsFileStore.getRecordOutput();

const policyFields: { [key: string]: RegExp | undefined } = {
    version: /^STSv1$/,
    mode: /^(testing|enforce|none)$/,
    mx: /^(\*\.)?([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)+[a-z][-a-z0-9]{0,61}[a-z0-9]$/i,
    max_age: /^\d{1,8}$/,
}

async function queryMtaStsPolicy({ domain }: State): Promise<void> {
    domain = domain.toLowerCase();
    mtaStsFileStore.resetState();
    try {
        const recordQuery = await makeQuery('_mta-sts.' + domain);
        mtaStsFileStore.addQuery(recordQuery);
        const records = recordQuery.records.filter(record => /^v=STSv1[ \t]*;.*$/.test(record.content));
        if (records.length === 0) {
            recordQuery.remarks.push({
                type: 'info',
                text: 'This domain has no MTA-STSv1 record.',
            });
        } else if (records.length > 1) {
            recordQuery.remarks.push({
                type: 'error',
                text: 'There may be only one MTA-STSv1 record at a given domain.',
                link: 'https://datatracker.ietf.org/doc/html/rfc8461#section-3.1',
            });
        } else {
            const record = records[0];
            if (!/^v=STSv1[ \t]*;[ \t]*id=[a-zA-Z0-9]{1,32}([ \t]*;[ \t]*)?$/.test(record.content)) {
                record.remarks.push({
                    type: 'warning',
                    text: 'The MTA-STS record does not match the expected format.',
                    link: 'https://datatracker.ietf.org/doc/html/rfc8461#section-3.1',
                });
            }
        }
        const actualUrl = `https://mta-sts.${domain}/.well-known/mta-sts.txt`;
        const proxyUrl = `http${secure}://${endpoint}/mta-sts.txt?domain=${domain}`;
        const fileQuery: Query = {
            domain: actualUrl,
            cnames: [],
            remarks: [{
                type: 'info',
                text: 'Loading… (The proxy server is being started.)',
            }],
            records: [],
        };
        mtaStsFileStore.addQuery(fileQuery);
        mtaStsFileStore.setState();
        try {
            const response = await fetchWithError(proxyUrl);
            const content = await response.text();
            const record: Record = {
                content,
                remarks: [],
                buttons: [],
            }
            fileQuery.records.push(record);
            fileQuery.remarks = [];
            const fields = content.split('\n');
            if (getLastElement(fields) === '') {
                fields.pop();
            }
            const encountered: Set<string> = new Set();
            let mode = '';
            for (const field of fields) {
                const index = field.indexOf(':');
                if (index === -1) {
                    record.remarks.push({
                        type: 'error',
                        text: field.trim() === '' ? 'Empty lines are not allowed according to the official grammar.' : `"${field.trim()}" is not a valid policy field as it lacks a colon.`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc8461#section-3.2',
                    });
                } else {
                    const name = field.substring(0, index);
                    const regex = policyFields[name];
                    if (/[ \t]/.test(name)) {
                        record.remarks.push({
                            type: 'error',
                            text: `The name "${name}" contains whitespace.`,
                            link: 'https://datatracker.ietf.org/doc/html/rfc8461#section-3.2',
                        });
                    } else if (regex === undefined) {
                        record.remarks.push({
                            type: 'warning',
                            text: `This tool doesn't know the policy name "${name}".`,
                            link: 'https://www.iana.org/assignments/mta-sts/mta-sts.xhtml#mta-sts-policy-fields',
                        });
                    } else {
                        const value = field.substring(index + 1).trim();
                        if (name !== 'mx' && encountered.has(name)) {
                            record.remarks.push({
                                type: 'warning',
                                text: `Duplicate occurrences of "${name}" are ignored.`,
                                link: 'https://datatracker.ietf.org/doc/html/rfc8461#section-3.2',
                            });
                        } else {
                            encountered.add(name);
                            if (name === 'mode') {
                                mode = value;
                            }
                        }
                        if (!regex.test(value)) {
                            record.remarks.push({
                                type: 'error',
                                text: `"${value}" is not a valid value for "${name}".`,
                                link: 'https://datatracker.ietf.org/doc/html/rfc8461#section-3.2',
                            });
                        }
                    }
                }
            }
            for (const name of ['version', 'mode', 'max_age']) {
                if (!encountered.has(name)) {
                    record.remarks.push({
                        type: 'error',
                        text: `Each MTA-STS policy must have a "${name}".`,
                        link: 'https://datatracker.ietf.org/doc/html/rfc8461#section-3.2',
                    });
                }
            }
            if (mode !== 'none' && !encountered.has('mx')) {
                record.remarks.push({
                    type: 'error',
                    text: `Each MTA-STS policy whose mode is not "none" must have at least one "mx" field.`,
                    link: 'https://datatracker.ietf.org/doc/html/rfc8461#section-3.2',
                });
            }
        } catch (error) {
            fileQuery.remarks = [{
                type: 'info',
                text: 'This domain has no MTA-STS policy file.',
            }];
        }
        mtaStsFileStore.setState();
    } catch (error) {
        mtaStsFileStore.setError(error);
    }
}

/* ------------------------------ TLS reporting ------------------------------ */

const tlsReportingStore = new RecordStore();
const TlsReportingOutput = tlsReportingStore.getRecordOutput();

async function queryTlsReporting({ domain }: State): Promise<void> {
    domain = domain.toLowerCase();
    tlsReportingStore.resetState();
    try {
        const query = await makeQuery('_smtp._tls.' + domain, 'https://datatracker.ietf.org/doc/html/rfc8460#section-7');
        tlsReportingStore.addQuery(query);
        const records = query.records.filter(record => /^v=TLSRPTv1[ \t]*;.*$/.test(record.content));
        if (records.length === 0) {
            query.remarks.push({
                type: 'info',
                text: 'This domain has no TLSRPTv1 record.',
            });
        } else if (records.length > 1) {
            query.remarks.push({
                type: 'error',
                text: 'There may be only one TLSRPTv1 record at a given domain.',
                link: 'https://datatracker.ietf.org/doc/html/rfc8460#section-3',
            });
        } else {
            const record = records[0];
            if (!/^v=TLSRPTv1[ \t]*;[ \t]*rua=(mailto:[a-zA-Z0-9.!#$%&'*+\-/=?^_`{|}~]+@([-a-zA-Z0-9]{1,63}\.)+[-a-zA-Z0-9]{1,63}|https:\/\/([-a-zA-Z0-9]{1,63}\.)+[-a-zA-Z0-9]{1,63}(:\d+)?\/[^,!;\s]*)([ \t]*,[ \t]*(mailto:[a-zA-Z0-9.!#$%&'*+\-/=?^_`{|}~]+@([-a-zA-Z0-9]{1,63}\.)+[-a-zA-Z0-9]{1,63}|https:\/\/([-a-zA-Z0-9]{1,63}\.)+[-a-zA-Z0-9]{1,63}(:\d+)?\/[^,!;\s]*))*([ \t]*;[ \t]*)?$/.test(record.content)) {
                record.remarks.push({
                    type: 'warning',
                    text: 'The TLSRPTv1 record does not match the expected format.',
                    link: 'https://datatracker.ietf.org/doc/html/rfc8460#section-3',
                });
            }
        }
        tlsReportingStore.setState();
    } catch (error) {
        tlsReportingStore.setError(error);
    }
}

/* ------------------------------ Input ------------------------------ */

const inputWidth = 270;

const domainRegex = /^([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*[a-z][-a-z0-9]{0,61}[a-z0-9]$/i;

const domain: DynamicTextEntry = {
    label: 'Domain',
    tooltip: 'The domain name you want to query.',
    defaultValue: 'gmail.com',
    suggestedValues: ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'me.com', 'ef1p.com', 'explained-from-first-principles.com'],
    inputType: 'text',
    inputWidth,
    validateIndependently: input =>
        input === '' && 'The domain name may not be empty.' ||
        input.includes(' ') && 'The domain name may not contain spaces.' || // Redundant to the regular expression, just a more specific error message.
        input.length > 253 && 'The domain name may be at most 253 characters long.' ||
        !input.split('.').every(label => label.length < 64) && 'Each label may be at most 63 characters long.' || // Redundant to the regular expression, just a more specific error message.
        !/^[-a-z0-9\.]+$/i.test(input) && 'You can use only English letters, digits, hyphens, and dots.' || // Redundant to the regular expression, just a more specific error message.
        !domainRegex.test(input) && 'The pattern of the domain name is invalid.',
};

const dkimSelector: DynamicTextEntry = {
    label: 'Selector',
    tooltip: 'The name of the DKIM key you want to query.',
    defaultValue: '20161025',
    inputType: 'text',
    inputWidth: inputWidth / 2,
    validateIndependently: input => !/^([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$/i.test(input) && 'The selector has the same format as a domain name.',
};

const bimiSelector: DynamicTextEntry = {
    label: 'Selector',
    tooltip: 'The name of the brand indicator you want to query.',
    defaultValue: 'default',
    inputType: 'text',
    inputWidth: inputWidth / 2,
    validateIndependently: input => !/^([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$/i.test(input) && 'The selector has the same format as a domain name.',
};

interface State {
    domain: string;
    dkimSelector: string;
    bimiSelector: string;
}

const entries: DynamicEntries<State> = {
    domain,
    dkimSelector,
    bimiSelector,
};

const store = new VersionedStore(entries, 'lookup-email-domain');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);

/* ------------------------------ Tools ------------------------------ */

export const toolLookupSrvRecords: Tool = [
    <Fragment>
        <Input entries={{ domain }} submit={{ label: 'Query', tooltip: 'Query the SRV records of the given domain name.', onClick: querySrvRecords }}/>
        <SrvRecordsOutput/>
    </Fragment>,
    store,
    querySrvRecords,
];

export const toolLookupConfigurationDatabase: Tool = [
    <Fragment>
        <Input entries={{ domain }} submit={{ label: 'Query', tooltip: 'Query the configuration database for the given domain name.', onClick: queryConfigurationDatabase }}/>
        <ConfigurationDatabaseOutput/>
    </Fragment>,
    store,
    queryConfigurationDatabase,
];

export const toolLookupMxRecords: Tool = [
    <Fragment>
        <Input entries={{ domain }} submit={{ label: 'Query', tooltip: 'Query the MX records of the given domain name.', onClick: queryMxRecords }}/>
        <MxRecordsOutput/>
    </Fragment>,
    store,
    queryMxRecords,
];

export const toolLookupSpfRecord: Tool = [
    <Fragment>
        <Input entries={{ domain }} submit={{ label: 'Query', tooltip: 'Query the SPF record of the given domain name.', onClick: querySpfRecord }}/>
        <SpfRecordOutput/>
    </Fragment>,
    store,
    querySpfRecord,
];

export const toolLookupDkimRecord: Tool = [
    <Fragment>
        <Input entries={{ domain, dkimSelector }} submit={{ label: 'Load', tooltip: 'Load the DKIM record of the given domain name.', onClick: loadDkimRecord }}/>
        <DkimRecordOutput/>
    </Fragment>,
    store,
    loadDkimRecord,
];

export const toolLookupDmarcRecord: Tool = [
    <Fragment>
        <Input entries={{ domain }} submit={{ label: 'Load', tooltip: 'Load the DMARC record of the given domain name.', onClick: loadDmarcRecord }}/>
        <DmarcRecordOutput/>
    </Fragment>,
    store,
    loadDmarcRecord,
];

export const toolLookupBimiRecord: Tool = [
    <Fragment>
        <Input entries={{ domain, bimiSelector }} submit={{ label: 'Query', tooltip: 'Query the BIMI record of the given domain name.', onClick: queryBimiRecord }}/>
        <BimiRecordOutput/>
    </Fragment>,
    store,
    queryBimiRecord,
];

export const toolLookupTlsaRecords: Tool = [
    <Fragment>
        <Input entries={{ domain }} submit={{ label: 'Query', tooltip: 'Query the TLSA records of the given domain name.', onClick: queryTlsaRecords }}/>
        <TlsaRecordsOutput/>
    </Fragment>,
    store,
    queryTlsaRecords,
];

export const toolLookupMtaStsPolicy: Tool = [
    <Fragment>
        <Input entries={{ domain }} submit={{ label: 'Query', tooltip: 'Query the MTA-STS policy of the given domain name.', onClick: queryMtaStsPolicy }}/>
        <MtaStsFileOutput/>
    </Fragment>,
    store,
    queryMtaStsPolicy,
];

export const toolLookupTlsReporting: Tool = [
    <Fragment>
        <Input entries={{ domain }} submit={{ label: 'Query', tooltip: 'Query the TLS reporting record of the given domain name.', onClick: queryTlsReporting }}/>
        <TlsReportingOutput/>
    </Fragment>,
    store,
    queryTlsReporting,
];

export const emailDomainInput = <Input entries={{ domain, dkimSelector }}/>;
export const emailDomainOutput = <OutputEntries entries={{ domain }}/>;
export const emailDkimSelectorOutput = <OutputEntries entries={{ dkimSelector }}/>;
