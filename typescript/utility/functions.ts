export function normalizeToValue<T>(argument: T | (() => T)): T {
    return typeof argument === 'function' ? (argument as () => T)() : argument;
}

export function normalizeToArray<T>(argument: undefined | T | T[]): T[] {
    if (argument === undefined) {
        return [];
    } else {
        return Array.isArray(argument) ? argument : [ argument ];
    }
}

export function removeFromArrayOnce<T>(array: T[], value: T): boolean {
    const index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

export function removeFromArrayAll<T>(array: T[], value: T): boolean {
    let found = false;
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] === value) {
            array.splice(i, 1);
            found = true;
        }
    }
    return found;
}

export function replaceFirstInPlace<T>(array: T[], oldValue: T, newValue: T): boolean {
    const index = array.indexOf(oldValue);
    if (index !== -1) {
        array[index] = newValue;
        return true;
    } else {
        return false;
    }
}

// https://codereview.stackexchange.com/a/202442
export function filterUndefined<T>(ts: (T | undefined)[]): T[] {
    return ts.filter((t: T | undefined): t is T => t !== undefined)
}
