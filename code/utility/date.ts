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

/* IMAP format */

const months: { [key: string]: string | undefined } = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
}

export function toImapFormat(YYYY_MM_DD: string): string {
    const parts = YYYY_MM_DD.split('-');
    return Number.parseInt(parts[2], 10).toString() + '-' + (months[parts[1]] ?? 'Jan') + '-' + parts[0];
}
