export const fetchOptions: RequestInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'omit',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
};

export async function fetchWithError(url: string): Promise<Response> {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}. The response status was ${response.status}.`);
    }
    return response;
}

export function fetchWithErrorAndTimeout(url: string, timeoutInMs = 2000): Promise<Response> {
    return Promise.race<Promise<Response>>([
        fetchWithError(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Custom timeout when fetching ${url} after ${timeoutInMs} ms.`)), timeoutInMs),
        ),
    ]);
}
