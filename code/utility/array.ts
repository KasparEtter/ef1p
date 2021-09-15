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

export function arrayEquals<T extends Equality<T>>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (!a[i].equals(b[i])) {
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
