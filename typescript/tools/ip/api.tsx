import { createElement, ReactNode } from 'react';

import { fetchWithErrorAndTimeout } from '../../utility/fetch';

/* ------------------------------ API ------------------------------ */

const token = 'ba0234c01f79d3';
const endpoint = 'https://ipinfo.io/';

export interface IpInfoResponse {
    ip: string;
}

export interface BogonIpInfoResponse extends IpInfoResponse {
    bogon: boolean;
}

export interface SuccessfulIpInfoResponse extends IpInfoResponse {
    city: string;
    country: string;
    hostname?: string;
    loc: string;
    org: string;
    postal: string;
    region: string;
    timezone: string;
}

export function isSuccessfulIpInfoResponse(response: IpInfoResponse): response is SuccessfulIpInfoResponse {
    return (response as SuccessfulIpInfoResponse).city !== undefined;
}

export async function getIpInfo(ipAddress?: string): Promise<IpInfoResponse> {
    const response = await fetchWithErrorAndTimeout(endpoint + (ipAddress ?? 'json') + '?token=' + token);
    return response.json();
}

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
