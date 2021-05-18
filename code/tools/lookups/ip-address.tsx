/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { copyToClipboard } from '../../utility/clipboard';

import { DynamicOutput } from '../../react/code';
import { DynamicEntry } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { shareState, shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getCurrentState, getDefaultVersionedState, ProvidedDynamicEntries, setState, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore, Store } from '../../react/store';

import { getReverseLookupDomain } from '../../apis/dns-lookup';
import { setDnsResolverInputs } from './dns-records';

import { getIpInfo, IpInfoResponse, isSuccessfulIpInfoResponse } from '../../apis/ip-geolocation';

/* ------------------------------ Utility ------------------------------ */

// https://developers.google.com/maps/documentation/urls/get-started#map-action
export function getMapLink(response: IpInfoResponse, fallback: ReactNode = 'unknown'): ReactNode {
    if (isSuccessfulIpInfoResponse(response)) {
        return <a href={`https://www.google.com/maps/@?api=1&map_action=map&center=${response.loc}&zoom=10`}>
            {response.city} ({response.country})
        </a>;
    } else {
        return fallback;
    }
}

/* ------------------------------ Response paragraph ------------------------------ */

interface IpInfoResponseState {
    response?: IpInfoResponse;
    error?: boolean;
}

function RawIpInfoResponseParagraph({ response, error }: Readonly<IpInfoResponseState>): JSX.Element | null {
    if (error) {
        return <p>Could not retrieve information about this IP address. Make sure you have your adblocker disabled for this site.</p>;
    } else if (response) {
        if (isSuccessfulIpInfoResponse(response)) {
            const address = <DynamicOutput
                title="Click to copy. Right click to do a reverse lookup."
                onClick={_ => copyToClipboard(response.ip)}
                onContextMenu={event => {
                    setDnsResolverInputs(getReverseLookupDomain(response.ip), 'PTR');
                    window.location.hash = '#tool-lookup-dns-records';
                    event.preventDefault();
                }}
            >
                {response.ip}
            </DynamicOutput>;
            const location = getMapLink(response);
            const provider = response.org?.replace(/^AS\d+/, '');
            if (getCurrentState(store).ipAddress === '') {
                return <p className="dynamic-output-pointer">
                    Your IP address is {address}.
                    You're currently in {location}
                    {provider ? `, using the network of ${provider}` : ''}.
                </p>;
            } else {
                return <p className="dynamic-output-pointer">
                    The device with the IP address {address} is likely located in {location}.
                    {provider ? ` The network is operated by ${provider}.` : ''}
                </p>;
            }
        } else {
            return <p>
                This IP address is <a href="https://en.wikipedia.org/wiki/Reserved_IP_addresses">reserved for special use</a>.
            </p>;
        }
    } else {
        return null; // Nothing is displayed initially.
    }
}

const ipInfoResponseStore = new Store<IpInfoResponseState>({}, undefined);
const IpInfoResponseParagraph = shareState<IpInfoResponseState>(ipInfoResponseStore)(RawIpInfoResponseParagraph);

async function updateIpInfoResponseParagraph({ ipAddress }: State): Promise<void> {
    try {
        const response = await getIpInfo(ipAddress);
        ipInfoResponseStore.setState({ response, error: false });
    } catch (_) {
        ipInfoResponseStore.setState({ error: true });
    }
}

/* ------------------------------ Dynamic entries ------------------------------ */

const ipAddress: DynamicEntry<string> = {
    name: 'IPv4 address',
    description: 'The IPv4 address you are interested in or nothing to take yours.',
    defaultValue: '',
    inputType: 'text',
    labelWidth: 95,
    inputWidth: 170, // 145 without placeholder.
    placeholder: 'defaults to your address',
    validate: value => value !== '' && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value) && 'Please enter an IPv4 address or leave the field empty.',
};

interface State {
    ipAddress: string;
}

const entries: DynamicEntries<State> = {
    ipAddress,
};

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries, onChange: updateIpInfoResponseParagraph }, 'lookup-ip-address');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);

export function setIpInfoInput(ipAddress: string): void {
    setState(store, { ipAddress });
}

/* ------------------------------ User interface ------------------------------ */

export const toolLookupIpAddress = <Fragment>
    <Input
        entries={entries}
        submit={{
            text: 'Locate',
            title: 'Locate the given IPv4 address.',
            onClick: () => {},
        }}
    />
    <IpInfoResponseParagraph/>
</Fragment>;
