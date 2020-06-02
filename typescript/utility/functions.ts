export function normalizeToArray<T>(argument: undefined | T | T[]): T[] {
    if (argument === undefined) {
        return [];
    } else {
        return Array.isArray(argument) ? argument : [ argument ];
    }
}

// https://codereview.stackexchange.com/a/202442
export function filterUndefined<T>(ts: (T | undefined)[]): T[] {
    return ts.filter((t: T | undefined): t is T => t !== undefined)
}
