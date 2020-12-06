import { getInitialized } from './functions';

if (typeof(Storage) === 'undefined') {
    console.error('Your browser does not support local storage.');
}

/**
 * Stores the given item with the given key in the local storage.
 */
export function setItem<T = any>(key: string, item: T): void {
    if (typeof(Storage) !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(item));
    }
}

/**
 * The callback is never called with an undefined item.
 */
export type Callback<T> = (item: T) => any;

const callbacks: { [key: string]: Callback<any>[] | undefined } = {};

function parse<T>(item: string | null): T | undefined {
    return item !== null ? JSON.parse(item) : undefined;
}

window.addEventListener('storage', event => {
    const key = event.key;
    const item = parse(event.newValue);
    if (key !== null && item !== undefined) {
        for (const callback of getInitialized(callbacks, key)) {
            callback(item);
        }
    }
});

/**
 * Retrieves the item with the given key from the local storage.
 * If another window changes the item with the given key,
 * the callback is called with the new value of the item.
 */
export function getItem<T = any>(key: string, callback?: Callback<T>): T | undefined {
    if (callback !== undefined) {
        getInitialized(callbacks, key).push(callback);
    }
    if (typeof(Storage) !== 'undefined') {
        return parse(localStorage.getItem(key));
    }
    return undefined;
}
