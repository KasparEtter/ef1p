import { createElement, Fragment } from 'react';

import { copyToClipboard } from '../../utility/clipboard';

import { AllEntries, DynamicEntries, DynamicEntry, getCurrentState, getDefaultPersistedState, PersistedState, ProvidedDynamicEntries, setState, StateWithOnlyValues } from '../../react/entry';
import { RawInput, RawInputProps } from '../../react/input';
import { shareState, shareStore } from '../../react/share';
import { PersistedStore, Store } from '../../react/store';

import { getIpInfo, IpInfoResponse, isSuccessfulIpInfoResponse } from './api';

interface IpInfoResponseState {
    response?: IpInfoResponse;
    error?: boolean;
}

function RawIpInfoResponseParagraph({ response, error }: Readonly<IpInfoResponseState>): JSX.Element | null {
    if (error) {
        return <p>Could not retrieve information about this IP address. Make sure you have your adblocker disabled for this site.</p>;
    } else if (response) {
        if (isSuccessfulIpInfoResponse(response)) {
            const location = <a href={`https://www.google.com/maps/@${response.loc},14z`}>{response.city} ({response.country})</a>;
            const provider = response.org.replace(/^AS\d+/, '');
            if (getCurrentState(store).ipAddress === '') {
                return <p className="dynamic-output-pointer">
                    Your IP address is <span
                        className="dynamic-output"
                        title="Click to copy."
                        onClick={_ => copyToClipboard(response.ip)}
                    >{response.ip}</span>.
                    You're currently in {location},
                    using the network of {provider}.
                </p>;
            } else {
                return <p>
                    The device with this IP address is likely located in {location}.
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

function updateIpInfoResponseParagraph({ ipAddress }: State): void {
    getIpInfo(ipAddress)
    .then(response => ipInfoResponseStore.setState({ response, error: false }))
    .catch(_ => ipInfoResponseStore.setState({ error: true }));
}

const ipAddress: DynamicEntry<string> = {
    name: 'IPv4 address',
    description: 'The IPv4 address you are interested in or nothing to take yours.',
    defaultValue: '',
    inputType: 'text',
    labelWidth: 95,
    inputWidth: 145,
    validate: value => value !== '' && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value) && 'Please enter an IPv4 address or leave the field empty.',
};

interface State extends StateWithOnlyValues {
    ipAddress: string;
}

const entries: DynamicEntries<State> = {
    ipAddress,
};

const store = new PersistedStore<PersistedState<State>, AllEntries<State>>(getDefaultPersistedState(entries), { entries, onChange: updateIpInfoResponseParagraph }, 'ip');
const Input = shareStore<PersistedState<State>, ProvidedDynamicEntries<State> & RawInputProps, AllEntries<State>>(store)(RawInput);

export function setIpInfoInput(ipAddress: string): void {
    setState(store, { ipAddress });
}

export const ipTool = <Fragment>
    <Input entries={{ ipAddress }} horizontal />
    <IpInfoResponseParagraph/>
</Fragment>;
