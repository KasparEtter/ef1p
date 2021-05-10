/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

export function round3(value: number): number {
    return Math.round(value * 1000) / 1000;
}

export function degrees(value: number): number {
    return value * 180 / Math.PI;
}
