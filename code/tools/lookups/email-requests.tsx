/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { copyToClipboard } from '../../utility/clipboard';
import { getRandomString } from '../../utility/string';
import { Time } from '../../utility/time';

import { ClickToCopy } from '../../react/copy';
import { DynamicEntry } from '../../react/entry';
import { getInput } from '../../react/input';
import { shareState } from '../../react/share';
import { DynamicEntries, getPersistedStore, setState } from '../../react/state';
import { Store } from '../../react/store';
import { Tool } from '../../react/utility';

import { getIpInfo, IpInfoResponse } from '../../apis/ip-geolocation';

import { setBody } from '../protocols/esmtp';

import { getMapLink } from './ip-address';

/* ------------------------------ Configuration ------------------------------ */

export const endpoint = 'ef1p.herokuapp.com';

function getLinkAddress(token: string, link: string): string {
    return `https://${endpoint}/${token}/${encodeURIComponent(link)}`;
}

function getImageAddress(token: string): string {
    return `https://${endpoint}/${token}.png`;
}

function getBody(token: string, link: string): string {
    return `<html>
<body>
<p>
Hello, visit
<a href="${getLinkAddress(token, link)}">
${link}
</a>
<img src="${getImageAddress(token)}">
</p>
</body>
</html>`;
}

/* ------------------------------ Response table ------------------------------ */

interface Request {
    time: string;
    target: string;
    address: string;
    location: IpInfoResponse;
    client: string;
}

interface RequestsState {
    subscribing: boolean;
    requests: Request[];
    message?: string;
    token?: string;
    link?: string;
}

function RawRequestsTable({ subscribing, requests, message, token, link }: Readonly<RequestsState>): JSX.Element {
    return <Fragment>
        {
            !message && subscribing &&
            <p className="text-center">Please wait until the service has been started.</p>
        }
        {
            requests.length > 0 &&
            <table className="text-nowrap">
                <thead>
                    <th>Time</th>
                    <th>Target</th>
                    <th>Address</th>
                    <th>Location</th>
                    <th>Client</th>
                </thead>
                <tbody>
                    {requests.map((request, index) => <tr key={index}>
                        <td>{request.time}</td>
                        <td>{request.target}</td>
                        <td><ClickToCopy>{request.address}</ClickToCopy></td>
                        <td>{getMapLink(request.location)}</td>
                        <td>{request.client}</td>
                    </tr>)}
                </tbody>
            </table>
        }
        {
            message &&
            <p className="text-center">{message}</p>
        }
        {
            !message && token && requests.length === 0 &&
            <p className="text-center">The link hasn't been visited and the image hasn't been requested yet.</p>
        }
        {
            token && link &&
            <p className="text-center">
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => copyToClipboard(getLinkAddress(token, link))}
                    title="Copy the link address to your clipboard."
                >
                    Copy the link address
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-primary ml-3"
                    onClick={() => copyToClipboard(getImageAddress(token))}
                    title="Copy the image address to your clipboard."
                >
                    Copy the image address
                </button>
                <a
                    href="#tool-protocol-esmtp"
                    className="btn btn-sm btn-primary ml-3"
                    onClick={() => setBody('text/html', getBody(token, link))}
                    title="Generate the email body with the given link."
                >
                    Generate the email body
                </a>
                <button
                    type="button"
                    className="btn btn-sm btn-primary ml-3"
                    onClick={unsubscribe}
                    title="Unsubscribe from the service."
                >
                    Unsubscribe from the service
                </button>
            </p>
        }
    </Fragment>;
}

const requestsStore = new Store<RequestsState>({ subscribing: false, requests: [] }, undefined);
const RequestsTable = shareState(requestsStore)(RawRequestsTable);

function clearRequestsTable(): void {
    requestsStore.setState({
        subscribing: false,
        requests: [],
        message: undefined,
        token: undefined,
        link: undefined,
    });
}

/* ------------------------------ Subscription ------------------------------ */

let socket: WebSocket | undefined;
let interval: number | undefined;

interface Data {
    target: string;
    address: string;
    client: string;
}

async function onMessage(message: MessageEvent<string>): Promise<void> {
    const data = JSON.parse(message.data) as Data;
    const location = await getIpInfo(data.address);
    requestsStore.state.requests.push({
        time: Time.current().toLocalTime().toGregorianTime(),
        target: data.target,
        address: data.address,
        location,
        client: data.client,
    });
    requestsStore.update();
}

function unsubscribe(): void {
    if (socket !== undefined) {
        socket.close();
    }
}

function subscribe({ token, link }: State): void {
    if (token === '') {
        token = getRandomString();
        setState(store, { token });
    }
    unsubscribe();
    requestsStore.setState({ subscribing: true });
    const address = `wss://${endpoint}/${token}`;
    socket = new WebSocket(address);
    socket.onopen = function() {
        interval = window.setInterval(() => this.send('keep alive'), 30000);
        console.log(`WebSocket to '${address}' opened.`);
        requestsStore.setState({ subscribing: false, token, link });
    };
    socket.onerror = () => {
        requestsStore.setState({ message: 'An error occurred.' });
    }
    socket.onclose = () => {
        if (interval !== undefined) {
            window.clearInterval(interval);
            interval = undefined;
        }
        socket = undefined;
        console.log(`WebSocket to '${address}' closed.`);
        requestsStore.setState({ token: undefined, link: undefined });
    };
    socket.onmessage = onMessage;
}

/* ------------------------------ Dynamic entries ------------------------------ */

const token: DynamicEntry<string> = {
    name: 'Token',
    description: 'The token used to identify the requests.',
    defaultValue: '',
    inputType: 'text',
    inputWidth: 150,
    validate: value => !/^[a-z0-9]*$/i.test(value) && 'The token has to consist of just letters and digits.',
    determine: {
        text: 'Generate',
        title: 'Generate a random token.',
        onClick: async () => [getRandomString(), false],
    },
};

const link: DynamicEntry<string> = {
    name: 'Link',
    description: 'The web address for which you want to track when someone clicks on it.',
    defaultValue: 'https://ef1p.com/email',
    inputType: 'text',
    inputWidth: 300,
    validate: value =>
        // These checks are redundant to the regular expression on the last line of this entry but they provide a more specific error message.
        value === '' && 'The web address may not be empty.' ||
        value.includes(' ') && 'The web address may not contain spaces.' ||
        !value.startsWith('http://') && !value.startsWith('https://') && `The web address has to start with 'http://' or 'https://'.` ||
        !/^[-a-z0-9_.:/?&=!'()*%]+$/i.test(value) && 'Only the Latin alphabet is currently supported.' ||
        !/^(http|https):\/\/([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*[a-z][-a-z0-9]{0,61}[a-z0-9](:\d+)?(\/[a-z0-9-_.:/?&=!'()*%]*)?$/i.test(value) && 'The pattern of the web address is invalid.',
};

interface State {
    token: string;
    link: string;
}

const entries: DynamicEntries<State> = {
    token,
    link,
};

const store = getPersistedStore(entries, 'lookup-email-requests', clearRequestsTable);
const Input = getInput(store);

/* ------------------------------ User interface ------------------------------ */

export const toolLookupEmailRequests: Tool = [
    <Fragment>
        <Input
            submit={{
                text: 'Subscribe',
                title: 'Subscribe to the requests which are made with the given token.',
                onClick: subscribe,
            }}
        />
        <RequestsTable/>
    </Fragment>,
    store,
    subscribe,
];
