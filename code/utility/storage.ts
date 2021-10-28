/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { getInitializedArray } from './array';

function isQuotaExceededError(error: unknown): boolean {
    return error instanceof DOMException && (error.code === 22 || error.name === 'QuotaExceededError');
}

// Inspired by https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#feature-detecting_localstorage
function isLocalStorageAvailable(): boolean {
    if (typeof localStorage !== 'undefined') {
        try {
            const key = '_test_availability';
            localStorage.setItem(key, '1');
            localStorage.removeItem(key);
            return true;
        } catch (error: unknown) {
            return isQuotaExceededError(error) && localStorage.length !== 0;
        }
    } else {
        return false;
    }
}

const localStorageIsAvailable = isLocalStorageAvailable();

if (!localStorageIsAvailable) {
    console.warn('Your browser does not support local storage. As a consequence, entered values are not persisted across sessions.');
}

function parse<T = any>(item: string | null): T | null {
    try {
        return item !== null ? JSON.parse(item) : null;
    } catch (error: unknown) {
        console.log('Failed to parse the following string as JSON:', item);
        throw error;
    }
}

/**
 * The callback is called with null when the item has been removed.
 */
export type Callback<T> = (item: T | null) => any;

const callbacks: { [key: string]: Callback<any>[] | undefined } = {};

function notify<T>(key: string | null, item: T | null): void {
    const keys = key !== null ? [key] : Object.keys(callbacks);
    for (const key of keys) {
        for (const callback of getInitializedArray(callbacks, key)) {
            callback(item);
        }
    }
}

window.addEventListener('storage', event => {
    notify(event.key, parse(event.newValue));
});

/**
 * Retrieves the item with the given key from the local storage.
 * If another window changes the item with the given key,
 * the callback is called with the new value of the item
 * or null when the item has been removed.
 * The callback is also called if the item has been removed in this window.
 */
export function getItem<T>(key: string, callback?: Callback<T>): T | null {
    if (callback !== undefined) {
        getInitializedArray(callbacks, key).push(callback);
    }
    if (localStorageIsAvailable) {
        return parse(localStorage.getItem(key));
    }
    return null;
}

/**
 * We have to trigger the storage event for other scripts in the same window ourselves.
 */
function dispatchStorageEvent(key: string | null, newValue: string | null): void {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
}

function setItemAndDispatchStorageEvent<T>(key: string, item: T): void {
    const newValue = JSON.stringify(item);
    localStorage.setItem(key, newValue);
    dispatchStorageEvent(key, newValue);
}

function pruneHistoryIfPossible(item: any): boolean {
    if (item.states !== undefined && item.index !== undefined && item.events !== undefined) {
        item.states = [item.states[item.index]];
        item.index = 0;
        item.events = ['input'];
        return true;
    } else {
        return false;
    }
}

/**
 * Prunes the history of all persisted states from the local storage.
 */
 export function pruneAllHistories(): void {
    if (localStorageIsAvailable) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)!;
            const item = parse(localStorage.getItem(key))!;
            if (pruneHistoryIfPossible(item)) {
                setItemAndDispatchStorageEvent(key, item);
            }
        }
    }
}

/**
 * Stores the given item with the given key in the local storage.
 */
export function setItem<T>(key: string, item: T): void {
    if (localStorageIsAvailable) {
        try {
            setItemAndDispatchStorageEvent(key, item);
        } catch (error: unknown) {
            if (isQuotaExceededError(error)) {
                const warning = 'The data could not be stored in your browser because this website ran out of local storage.';
                console.warn(warning);
                if (confirm(
                    `Warning: ${warning} ` +
                    'If you continue, the histories of all tools are removed in order to make space for newly entered values. ' +
                    'Alternatively, you can cancel this dialog, increase the local storage quota of your browser, and then reload this page.',
                )) {
                    pruneAllHistories();
                    pruneHistoryIfPossible(item);
                    setItemAndDispatchStorageEvent(key, item);
                }
            } else {
                throw error;
            }
        }
    } else {
        notify(key, item);
    }
}

/**
 * Removes the item with the given key from the local storage.
 */
export function removeItem(key: string): void {
    if (localStorageIsAvailable) {
        localStorage.removeItem(key);
        dispatchStorageEvent(key, null);
    } else {
        notify(key, null);
    }
}

/**
 * Removes all items from the local storage.
 */
export function clear(): void {
    if (localStorageIsAvailable) {
        localStorage.clear();
        dispatchStorageEvent(null, null);
    } else {
        notify(null, null);
    }
}

/**
 * Returns the number of items in the local storage.
 */
export function getNumberOfItems(): number {
    if (localStorageIsAvailable) {
        return localStorage.length;
    } else {
        return 0;
    }
}
