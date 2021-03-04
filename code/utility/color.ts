export type Theme = 'dark' | 'light';

export interface ColorValues {
    dark: string;
    light: string;
}

export const colors = {
    blue: {
        dark:  '#4DA6FF',
        light: '#0066CC',
    } as ColorValues,
    purple: {
        dark:  '#DD33FF',
        light: '#BF00E6',
    } as ColorValues,
    pink: {
        dark:  '#FF3399',
        light: '#E60073',
    } as ColorValues,
    red: {
        dark:  '#FF3333',
        light: '#E60000',
    } as ColorValues,
    orange: {
        dark:  '#FF8833',
        light: '#E66000',
    } as ColorValues,
    yellow: {
        dark:  '#FFCC33',
        light: '#E6AC00',
    } as ColorValues,
    green: {
        dark:  '#00CC99',
        light: '#009973',
    } as ColorValues,
    brown: {
        dark:  '#BF8040',
        light: '#86592D',
    } as ColorValues,
    gray: {
        dark:  '#a6a6a6',
        light: '#666666',
    } as ColorValues,
    text: {
        dark:  '#FFFFFF',
        light: '#000000', // The actual value is '#212529' but this is likely not desired.
    } as ColorValues,
    background: {
        dark:  '#1A181B',
        light: '#FFFFFF',
    } as ColorValues,
};

export type Color = keyof typeof colors;

export function colorSuffix(color?: Color): string {
    return color ? '-' + color : '';
}

export function colorClass(color?: Color, prefix: string = ' '): string {
    return color ? prefix + 'color-' + color : '';
}
