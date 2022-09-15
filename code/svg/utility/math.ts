/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

export function round3(value: number): number {
    return Math.round(value * 1_000) / 1_000;
}

export function round6(value: number): number {
    return Math.round(value * 1_000_000) / 1_000_000;
}

export function radiansToDegrees(value: number): number {
    return value * 180 / Math.PI;
}
