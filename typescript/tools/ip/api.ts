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
    return fetch(endpoint + (ipAddress ?? 'json') + '?token=' + token, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Could not retrieve information about this IP address. The response status was ${response.status}.`);
        }
        return response.json();
    });
}
