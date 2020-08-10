import { createElement, Fragment } from 'react';

import { AllEntries, DynamicEntries, DynamicEntry, getDefaultPersistedState, PersistedState, ProvidedDynamicEntries, setState, StateWithOnlyValues } from '../../react/entry';
import { RawInput, RawInputProps } from '../../react/input';
import { shareState, shareStore } from '../../react/share';
import { PersistedStore, Store } from '../../react/store';
import { join } from '../../react/utility';

import { getAllRecords, RecordType, recordTypes, resolveDomainName } from '../dns/api';
import { setDnsResolverInputs } from '../dns/tool';

interface Row {
    name: string;
    types: string[];
}

interface ZoneWalkerResponseState {
    rows: Row[];
    message?: string;
    nextQuery?: string;
}

function RawZoneWalkerResponseTable({ rows, message, nextQuery }: Readonly<ZoneWalkerResponseState>): JSX.Element {
    return <Fragment>
        {
            rows.length > 0 &&
            <Fragment>
                <p className="text-center">
                    ⚠️ You click on links at your own risk! The linked websites can contain malware or disturbing content.
                </p>
                <table className="dynamic-output-pointer">
                    <thead>
                        <th>Domain name</th>
                        <th>Record types</th>
                    </thead>
                    <tbody>
                        {rows.map(row => <tr key={row.name}>
                            <td>{
                                (row.types.includes('CNAME') || row.types.includes('A') || row.types.includes('AAAA') || row.types.includes('NS')) ?
                                    <a href={'http://' + row.name.slice(0, -1)} title="Open this domain in a new browser window.">{row.name}</a> :
                                    <Fragment>{row.name}</Fragment>
                            }</td>
                            <td>{join(row.types.filter(type => type !== 'NSEC' && type !== 'RRSIG').map(
                                type => recordTypes[type as RecordType] !== undefined ?
                                    <a href="#tool-dns-resolver" title="Look up this record type with the DNS tool." onClick={() => setDnsResolverInputs(row.name, type as RecordType)}>{type}</a> :
                                    <Fragment>{type}</Fragment>,
                            ), <Fragment>, </Fragment>)}</td>
                        </tr>)}
                    </tbody>
                </table>
            </Fragment>
        }
        {
            message &&
            <p className="text-center">{message}</p>
        }
        {
            nextQuery &&
            <p className="text-center">
                <a href="#tool-zone-walker" className="btn btn-sm btn-primary" onClick={() => setZoneWalkerInputFields(nextQuery)}>
                    <i className="fas fa-arrow-alt-circle-right"></i>Continue
                </a>
            </p>
        }
    </Fragment>;
}

const zoneWalkerResponseStore = new Store<ZoneWalkerResponseState>({ rows: [] }, undefined);
const ZoneWalkerResponseTable = shareState<ZoneWalkerResponseState>(zoneWalkerResponseStore)(RawZoneWalkerResponseTable);

function appendAsteriskToFirstLabel(domainName: string): string {
    const labels = domainName.split('.');
    labels[0] += '*';
    return labels.join('.');
}

async function walkZone({ startDomain, resultLimit }: State): Promise<void> {
    const index = store.state.index;
    let currentDomain = startDomain;
    if (!currentDomain.endsWith('.')) {
        currentDomain += '.';
    }
    let currentDomainForQuery = currentDomain;
    if (currentDomain.includes('*')) {
        currentDomain = currentDomain.replace('*', '');
    }
    zoneWalkerResponseStore.state = { rows: [] };
    let counter = 0;
    while (true) {
        const response = await resolveDomainName(currentDomainForQuery, 'NSEC', true);
        if (index !== store.state.index) {
            return; // Abort if the state changed in the meantime.
        }
        const nsecRecords = getAllRecords(response, 'NSEC').filter(nsecRecord => nsecRecord.name === currentDomain);
        if (nsecRecords.length === 0) {
            if (counter > 0 && !currentDomainForQuery.includes('*')) {
                // We're in a subdomain which doesn't have NSEC records. Let's get out of it again.
                currentDomainForQuery = appendAsteriskToFirstLabel(currentDomain);
                continue;
            }
            zoneWalkerResponseStore.state.message = 'Could not find an NSEC record for ' + currentDomain;
            zoneWalkerResponseStore.update();
            return;
        }
        const types = nsecRecords[0].data.split(' ');
        const nextDomain = types.splice(0, 1)[0];
        if (counter > 0 && types.includes('SOA') && !currentDomainForQuery.includes('*')) {
            // We're in a subdomain which does have NSEC records. Let's get out of it again.
            currentDomainForQuery = appendAsteriskToFirstLabel(currentDomain);
            continue;
        }
        zoneWalkerResponseStore.state.rows.push({ name: currentDomain, types });
        if (currentDomain.endsWith(nextDomain)) {
            zoneWalkerResponseStore.state.message = 'You reached the end of the zone ' + nextDomain;
            zoneWalkerResponseStore.update();
            return;
        }
        counter++;
        if (counter === resultLimit) {
            zoneWalkerResponseStore.state.nextQuery = currentDomainForQuery;
            zoneWalkerResponseStore.update();
            return;
        }
        zoneWalkerResponseStore.update();
        currentDomain = nextDomain;
        currentDomainForQuery = currentDomain;
    }
}

const startDomain: DynamicEntry<string> = {
    name: 'Start domain',
    description: 'The domain name from which you would like to list the next domain names.',
    defaultValue: 'ietf.org',
    inputType: 'text',
    labelWidth: 95,
    inputWidth: 220,
    validate: value =>
        value === '' && 'The domain name may not be empty.' || // Redundant to the regular expression, just a more specific error message.
        value.includes(' ') && 'The domain name may not contain spaces.' || // Redundant to the regular expression, just a more specific error message.
        value.length > 253 && 'The domain name may be at most 253 characters long.' ||
        !value.split('.').every(label => label.length < 64) && 'Each part may be at most 63 characters long.' ||
        !/^[a-z0-9-_\.\*]+$/i.test(value) && 'Only the Latin alphabet is currently supported.' ||
        !/^(([a-z0-9-_]+\*?\.)*[a-z]{2,63})?\.?$/i.test(value) && 'The pattern of the domain name is invalid.',
};

const resultLimit: DynamicEntry<number> = {
    name: 'Result limit',
    description: 'Configure the maximum number of results to be returned.',
    defaultValue: 75,
    inputType: 'range',
    labelWidth: 84,
    minValue: 25,
    maxValue: 150,
    stepValue: 25,
};

interface State extends StateWithOnlyValues {
    startDomain: string;
    resultLimit: number;
}

const entries: DynamicEntries<State> = {
    startDomain,
    resultLimit,
};

const store = new PersistedStore<PersistedState<State>, AllEntries<State>>(getDefaultPersistedState(entries), { entries, onChange: walkZone }, 'zone');
const Input = shareStore<PersistedState<State>, ProvidedDynamicEntries<State> & RawInputProps, AllEntries<State>>(store)(RawInput);

export function setZoneWalkerInputFields(startDomain: string, resultLimit?: number): void {
    setState(store, resultLimit === undefined ? { startDomain } : { startDomain, resultLimit });
}

export const zoneTool = <Fragment>
    <Input entries={{ startDomain, resultLimit }} horizontal />
    <ZoneWalkerResponseTable/>
</Fragment>;

export function bindZoneWalks() {
    Array.from(document.getElementsByClassName('zone-walk') as HTMLCollectionOf<HTMLElement>).forEach(element => {
        const domain = element.dataset.domain;
        if (domain === undefined) {
            console.error('The data attributes of the following element are invalid:', element);
        } else {
            element.addEventListener('click', () => setZoneWalkerInputFields(domain, 25));
        }
    });
}
