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
import { DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { Store } from '../../react/store';
import { VersionedStore } from '../../react/versioned-store';

import { getIpInfo, IpInfoResponse } from '../../apis/ip-geolocation';

import { setBody } from '../protocol/esmtp';

import { getMapLink } from './ip-address';

/* ------------------------------ Configuration ------------------------------ */

export const secure = 's';
export const endpoint = 'ef1p.onrender.com';

// Once the BroadcastChannel (https://deno.com/deploy/docs/runtime-broadcast-channel) works again:
// export const endpoint = 'ef1p.deno.dev';

function getLinkAddress(token: string, link: string): string {
    return `http${secure}://${endpoint}/${token}/${encodeURIComponent(link)}`;
}

function getImageAddress(token: string): string {
    return `http${secure}://${endpoint}/${token}.png`;
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

/* ------------------------------ Output ------------------------------ */

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
    message?: string | undefined;
    token?: string | undefined;
    link?: string | undefined;
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

const requestsStore = new Store<RequestsState>({ subscribing: false, requests: [] });
const RequestsTable = requestsStore.injectState<{}>(RawRequestsTable);

function clearRequestsTable(): void {
    requestsStore.resetState();
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
    requestsStore.setState({ requests: [...requestsStore.getState().requests, {
        time: Time.current().toLocalTime().toGregorianTime(),
        target: data.target,
        address: data.address,
        location,
        client: data.client,
    }] });
}

function unsubscribe(): void {
    if (socket !== undefined) {
        socket.close();
    }
}

function subscribe({ token, link }: State): void {
    if (token === '') {
        token = getRandomString();
        store.setNewStateFromInput('token', token);
    }
    unsubscribe();
    requestsStore.setState({ subscribing: true });
    const address = `ws${secure}://${endpoint}/${token}`;
    socket = new WebSocket(address);
    socket.onopen = function() {
        interval = window.setInterval(() => this.send('keep alive'), 30000);
        console.log(`WebSocket to '${address}' opened.`);
        requestsStore.setState({ subscribing: false, token, link });
    };
    socket.onerror = event => {
        console.error(event);
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

/* ------------------------------ Input ------------------------------ */

const token: DynamicTextEntry = {
    label: 'Token',
    tooltip: 'The token used to identify the requests.',
    defaultValue: '',
    inputType: 'text',
    inputWidth: 150,
    validateIndependently: input => !/^[a-z0-9]*$/i.test(input) && 'The token has to consist of just letters and digits.',
    determine: {
        label: 'Generate',
        tooltip: 'Generate a random token.',
        onClick: async () => getRandomString(),
    },
};

const link: DynamicTextEntry = {
    label: 'Link',
    tooltip: 'The web address for which you want to track when someone clicks on it.',
    defaultValue: 'https://ef1p.com/email',
    inputType: 'text',
    inputWidth: 300,
    validateIndependently: input =>
        // These checks are redundant to the regular expression on the last line of this entry but they provide a more specific error message.
        input === '' && 'The web address may not be empty.' ||
        input.includes(' ') && 'The web address may not contain spaces.' ||
        !input.startsWith('http://') && !input.startsWith('https://') && `The web address has to start with 'http://' or 'https://'.` ||
        !/^[-a-z0-9_.:/?&=!'()*%]+$/i.test(input) && 'Only the Latin alphabet is currently supported.' ||
        !/^(http|https):\/\/([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*[a-z][-a-z0-9]{0,61}[a-z0-9](:\d+)?(\/[a-z0-9-_.:/?&=!'()*%]*)?$/i.test(input) && 'The pattern of the web address is invalid.',
};

interface State {
    token: string;
    link: string;
}

const entries: DynamicEntries<State> = {
    token,
    link,
};

const store = new VersionedStore(entries, 'lookup-email-requests', clearRequestsTable);
const Input = getInput(store);

/* ------------------------------ Tool ------------------------------ */

export const toolLookupEmailRequests: Tool = [
    <Fragment>
        <Input
            submit={{
                label: 'Subscribe',
                tooltip: 'Subscribe to the requests which are made with the given token.',
                onClick: subscribe,
            }}
        />
        <RequestsTable/>
    </Fragment>,
    store,
    subscribe,
];
