export function round3(value: number): number {
    return Math.round(value * 1000) / 1000;
}

export function degrees(value: number): number {
    return value * 180 / Math.PI;
}
