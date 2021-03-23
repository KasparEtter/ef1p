export function parse(value: string): number {
    return Number.parseInt(value, 10);
}

export const gregorianFormat = /^[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) at ([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

export const dayInSeconds = 86400;

export class Time {
    private constructor(private readonly date: Date) {}

    public static current(): Time {
        return new Time(new Date());
    }

    public static fromDate(date: Date): Time {
        return new Time(date);
    }

    public static fromUnix(time: string | number): Time {
        if (typeof time === 'string') {
            time = parse(time);
        }
        return new Time(new Date(time * 1000));
    }

    public static fromGregorian(text: string): Time {
        const [date, time] = text.split(' at ');
        const [year, month, day] = date.split('-');
        const [hour, minute, second] = time.split(':');
        return new Time(new Date(parse(year), parse(month) - 1, parse(day), parse(hour), parse(minute), parse(second)));
    }

    public toLocalTime(): Time {
        return new Time(new Date(this.date.getTime() - this.date.getTimezoneOffset() * 60000));
    }

    public toGlobalTime(): Time {
        return new Time(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000));
    }

    public toUnixTime(): number {
        return Math.round(this.date.getTime() / 1000);
    }

    public toGregorianDate(): string {
        return this.date.toISOString().substring(0, 10);
    }

    public toGregorianDateWithTime(seconds = true): string {
        return this.date.toISOString().substring(0, seconds ? 19 : 16).replace('T', ' at ');
    }

    public toGregorianTime(seconds = true): string {
        return this.date.toISOString().substring(11, seconds ? 19 : 16);
    }

    public floorToDay(): Time {
        return Time.fromUnix(Math.floor(this.toUnixTime() / dayInSeconds) * dayInSeconds);
    }
}
