/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Equality } from './object';

export function getInitializedArray<T>(object: { [key: string]: T[] | undefined }, key: string): T[] {
    let result = object[key];
    if (result === undefined) {
        result = [];
        object[key] = result;
    }
    return result;
}

export function removeFromArrayOnce<T>(array: T[], element: T): boolean {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

export function removeFromArrayAll<T>(array: T[], element: T): boolean {
    let found = false;
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] === element) {
            array.splice(i, 1);
            found = true;
        }
    }
    return found;
}

export function popFromArray<T extends Equality<T>>(array: T[], element: T): T[] {
    while (array.length > 0 && array[array.length - 1].equals(element)) {
        array.pop();
    }
    return array;
}

export function arrayEquals<T extends Equality<T>>(array1: T[], array2: T[]): boolean {
    if (array1.length !== array2.length) {
        return false;
    }
    for (let i = 0; i < array1.length; i++) {
        if (!array1[i].equals(array2[i])) {
            return false;
        }
    }
    return true;
}

export function replaceFirstInPlace<T>(array: T[], oldElement: T, newElement: T): boolean {
    const index = array.indexOf(oldElement);
    if (index !== -1) {
        array[index] = newElement;
        return true;
    } else {
        return false;
    }
}

// https://codereview.stackexchange.com/a/202442
export function filterUndefined<T>(array: (T | undefined)[]): T[] {
    return array.filter((t: T | undefined): t is T => t !== undefined)
}

export function flatten<T>(array: T[][]): T[] {
    return array.reduce((flat, next) => flat.concat(next), []);
}

export function unique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

export function sortNumbers(array: number[]): number[] {
    return array.sort((a, b) => a - b);
}

export function shorterAndLonger<T>(array1: T[], array2: T[]): [T[], T[]] {
    return array1.length < array2.length ? [array1, array2] : [array2, array1];
}

/**
 * The caller has to ensure that the given array is not empty.
 */
export function getFirstElement<T>(array: T[]): T {
    return array[0];
}

/**
 * The caller has to ensure that the given array is not empty.
 */
export function getLastElement<T>(array: T[]): T {
    return array[array.length - 1];
}
