// https://codereview.stackexchange.com/a/202442
export function filterUndefined<T>(ts: (T | undefined)[]): T[] {
    return ts.filter((t: T | undefined): t is T => t !== undefined)
}
