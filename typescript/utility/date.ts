/* Convert date to string */

export function toLocalISOString(date: Date): string {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}

export function toLocalDateString(date: Date): string {
    return toLocalISOString(date).slice(0, 10);
}

export function toLocalDateWithTimeString(date: Date): string {
    return toLocalISOString(date).slice(0, 16).replace('T', ' at ');
}

/* Current date */

export function getCurrentDate(): string {
    return toLocalDateString(new Date());
}

export function getCurrentDateWithTime(): string {
    return toLocalDateWithTimeString(new Date());
}

/* Unix timestamp */

export function toDate(unixTimestampInSeconds: string | number): Date {
    if (typeof unixTimestampInSeconds === 'string') {
        unixTimestampInSeconds = Number.parseInt(unixTimestampInSeconds, 10);
    }
    return new Date(unixTimestampInSeconds * 1000);
}

export function toLocalDate(unixTimestampInSeconds: string | number): string {
    return toLocalDateString(toDate(unixTimestampInSeconds));
}

export function toLocalDateWithTime(unixTimestampInSeconds: string | number): string {
    return toLocalDateWithTimeString(toDate(unixTimestampInSeconds));
}

