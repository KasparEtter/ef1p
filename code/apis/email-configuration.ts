/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { filterUndefined } from '../utility/array';
import { fetchWithErrorAndTimeout } from '../utility/fetch';

import { getAllRecords, getDataOfFirstRecord, resolveDomainName } from './dns-lookup';

/* ------------------------------ Configuration types ------------------------------ */

const serverTypes = ['smtp', 'imap', 'pop3'] as const;
export type ServerType = typeof serverTypes[number];

const socketTypes = ['SSL', 'STARTTLS', 'plain'] as const;
export type SocketType = typeof socketTypes[number];

export type UserName = '%EMAILADDRESS%' | '%EMAILLOCALPART%' | string;
export type AuthenticationMethod = 'plain' | 'password-cleartext' | 'password-encrypted' | 'OAuth2' | string;

export interface Server {
    type: ServerType;
    host: string;
    port: string;
    socket: SocketType;
    username: UserName;
    authentication: AuthenticationMethod[];
}

export interface Documentation {
    link: string;
    text: string;
}

export interface Configuration {
    name: string | undefined;
    incomingServers: Server[];
    outgoingServers: Server[];
    instructions: Documentation[];
    documentation: Documentation[];
    webmail: string | undefined;
}

/* ------------------------------ Configuration parsing ------------------------------ */

function contentOfFirst(node: Document | Element, tagName: string): string | undefined {
    return node.getElementsByTagName(tagName)[0]?.childNodes[0]?.nodeValue ?? undefined;
}

function map<T>(node: Document | Element, tagName: string, callBack: (element: Element) => T | undefined): T[] {
    return filterUndefined(Array.from(node.getElementsByTagName(tagName), callBack));
}

function contentOfAll(node: Document | Element, tagName: string): string[] {
    return map(node, tagName, element => element.childNodes[0]?.nodeValue ?? undefined);
}

function attributeOfFirst(document: Document, tagName: string, attributeName: string): string | undefined {
    return document.getElementsByTagName(tagName)[0]?.getAttribute(attributeName) ?? undefined;
}

function parseServer(element: Element): Server | undefined {
    const type = element.getAttribute('type') as ServerType | null;
    const host = contentOfFirst(element, 'hostname');
    const port = contentOfFirst(element, 'port');
    const socket = contentOfFirst(element, 'socketType') as SocketType | undefined;
    const username = contentOfFirst(element, 'username');
    const authentication = contentOfAll(element, 'authentication') as AuthenticationMethod[];
    if (
        type !== null &&
        serverTypes.includes(type) &&
        host !== undefined &&
        port !== undefined &&
        socket !== undefined &&
        socketTypes.includes(socket) &&
        username !== undefined
    ) {
        return { type, host, port, socket, username, authentication };
    } else {
        return undefined;
    }
}

function parseInstructionOrDocumentation(element: Element, attributeName: string, tagName: string): Documentation | undefined {
    const link = element.getAttribute(attributeName);
    const text = contentOfFirst(element, tagName);
    if (
        link !== null &&
        text !== undefined
    ) {
        return { link, text };
    } else {
        return undefined;
    }
}

function parseInstruction(element: Element): Documentation | undefined {
    return parseInstructionOrDocumentation(element, 'visiturl', 'instruction');
}

function parseDocumentation(element: Element): Documentation | undefined {
    return parseInstructionOrDocumentation(element, 'url', 'descr');
}

/* ------------------------------ Configuration fetching ------------------------------ */

export async function fetchConfigurationFile(url: string): Promise<Configuration> {
    const response = await fetchWithErrorAndTimeout(url);
    const xml = await response.text();
    const document = new DOMParser().parseFromString(xml, 'text/xml');
    const file: Configuration = {
        name: contentOfFirst(document, 'displayShortName') ?? contentOfFirst(document, 'displayName'),
        incomingServers: map(document, 'incomingServer', parseServer),
        outgoingServers: map(document, 'outgoingServer', parseServer),
        instructions: map(document, 'enable', parseInstruction),
        documentation: map(document, 'documentation', parseDocumentation),
        webmail: attributeOfFirst(document, 'loginPage', 'url'),
    };
    return file;
}

/* ------------------------------ Configuration finding ------------------------------ */

function queryConfigurationFile(requests: string[], url: string): Promise<Configuration> {
    requests.push(url);
    return fetchConfigurationFile(url);
}

export async function findConfigurationFile(domain: string, requests: string[], queryOnlyDatabase = false): Promise<Configuration | undefined> {
    if (!queryOnlyDatabase) {
        try {
            return await queryConfigurationFile(requests, `https://autoconfig.${domain}/mail/config-v1.1.xml?emailaddress=user@${domain}`);
        } catch (error) {
            console.error(error);
        }
        try {
            return await queryConfigurationFile(requests, `https://${domain}/.well-known/autoconfig/mail/config-v1.1.xml`);
        } catch (error) {
            console.error(error);
        }
    }
    try {
        return await queryConfigurationFile(requests, `https://autoconfig.thunderbird.net/v1.1/${domain}`);
    } catch (error) {
        console.error(error);
    }
    try {
        const mxData = await getDataOfFirstRecord(domain, 'MX');
        const incomingMailServer = mxData.split(' ')[1].toString(); // Cause error if undefined.
        const response = await resolveDomainName(incomingMailServer, 'SOA');
        const apex = getAllRecords(response, 'SOA')[0].name.slice(0, -1); // Caught below if no SOA was returned.
        if (apex !== domain) {
            return await queryConfigurationFile(requests, `https://autoconfig.thunderbird.net/v1.1/${apex}`);
        }
    } catch (error) {
        console.error(error);
    }
    return undefined;
}
