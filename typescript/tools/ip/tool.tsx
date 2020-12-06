import { Fragment } from 'react';

import { copyToClipboard } from '../../utility/clipboard';

import { DynamicOutput } from '../../react/code';
import { DynamicEntry } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { shareState, shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getCurrentState, getDefaultVersionedState, ProvidedDynamicEntries, setState, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore, Store } from '../../react/store';

import { getReverseLookupDomain } from '../dns/api';
import { setDnsResolverInputs } from '../dns/tool';

import { getIpInfo, getMapLink, IpInfoResponse, isSuccessfulIpInfoResponse } from './api';

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
                    window.location.hash = '#tool-dns-resolver';
                    event.preventDefault();
                }}
            >
                {response.ip}
            </DynamicOutput>;
            const location = getMapLink(response);
            const provider = response.org.replace(/^AS\d+/, '');
            if (getCurrentState(store).ipAddress === '') {
                return <p className="dynamic-output-pointer">
                    Your IP address is {address}.
                    You're currently in {location},
                    using the network of {provider}.
                </p>;
            } else {
                return <p className="dynamic-output-pointer">
                    The device with the IP address {address} is likely located in {location}.
                    The network is operated by {provider}.
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

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries, onChange: updateIpInfoResponseParagraph }, 'ip');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);

export function setIpInfoInput(ipAddress: string): void {
    setState(store, { ipAddress });
}

export const ipTool = <Fragment>
    <Input entries={entries} horizontal submit="Locate"/>
    <IpInfoResponseParagraph/>
</Fragment>;
