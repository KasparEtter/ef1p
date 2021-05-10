/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { getInitialized } from './functions';

if (typeof(Storage) === 'undefined') {
    console.warn('Your browser does not support local storage.');
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
 * If the callback is called with an undefined item, then the item has been removed.
 */
export type Callback<T> = (item: T | undefined) => any;

const callbacks: { [key: string]: Callback<any>[] | undefined } = {};

function parse<T>(item: string | null): T | undefined {
    return item !== null ? JSON.parse(item) : undefined;
}

function notify(key: string | null, value: string | null): void {
    if (key === null) { // All items have been removed.
        for (const key of Object.keys(callbacks)) {
            for (const callback of callbacks[key] ?? []) {
                callback(undefined);
            }
        }
    } else {
        const item = parse(value); // The new value is null if the item has been removed.
        for (const callback of getInitialized(callbacks, key)) {
            callback(item);
        }
    }
}

window.addEventListener('storage', event => {
    notify(event.key, event.newValue);
});

/**
 * Retrieves the item with the given key from the local storage.
 * If another window changes the item with the given key,
 * the callback is called with the new value of the item
 * or undefined if the item has been removed.
 * The callback is also called if the item has been removed in this window.
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

/**
 * Removes the item with the given key from the local storage.
 */
export function removeItem(key: string): void {
    if (typeof(Storage) !== 'undefined') {
        localStorage.removeItem(key);
        // We have to trigger the storage event for other scripts in the same window manually.
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: null }));
    }
}

/**
 * Removes all items from the local storage.
 */
export function clear(): void {
    if (typeof(Storage) !== 'undefined') {
        localStorage.clear();
        // We have to trigger the storage event for other scripts in the same window manually.
        window.dispatchEvent(new StorageEvent('storage', { key: null, newValue: null }));
    }
}

/**
 * Returns the number of items in the local storage.
 */
export function getNumberOfItems(): number {
    if (typeof(Storage) !== 'undefined') {
        return localStorage.length;
    }
    return 0;
}
