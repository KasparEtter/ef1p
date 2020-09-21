export const colors = {
    blue: {
        dark:  '#4DA6FF',
        light: '#0066CC',
    },
    purple: {
        dark:  '#DD33FF',
        light: '#BF00E6',
    },
    pink: {
        dark:  '#FF3399',
        light: '#E60073',
    },
    red: {
        dark:  '#FF3333',
        light: '#E60000',
    },
    orange: {
        dark:  '#FF8833',
        light: '#E66000',
    },
    yellow: {
        dark:  '#FFCC33',
        light: '#E6AC00',
    },
    green: {
        dark:  '#00CC99',
        light: '#009973',
    },
    brown: {
        dark:  '#BF8040',
        light: '#86592D',
    },
    gray: {
        dark:  '#1A181B',
        light: '#999999',
    },
    text: {
        dark:  '#FFFFFF',
        light: '#000000', // The actual value is '#212529' but this is likely not desired.
    },
    background: {
        dark:  '#1A181B',
        light: '#FFFFFF',
    },
};

export type Color = keyof typeof colors;

export function colorSuffix(color?: Color): string {
    return color ? '-' + color : '';
}

export function textColor(color?: Color, prefix: string = ''): string {
    return color ? prefix + 'text-' + color : '';
}
