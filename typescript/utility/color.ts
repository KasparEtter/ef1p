export const colors = {
    blue:   '#0066cc',
    purple: '#bf00e6',
    pink:   '#e60073',
    red:    '#e60000',
    orange: '#e66000',
    yellow: '#e6ac00',
    green:  '#009973',
    brown:  '#86592d',
    gray:   '#808080',
};

export type Color = keyof typeof colors;

export function colorSuffix(color?: Color): string {
    return color ? '-' + color : '';
}

export function textColor(color?: Color, prefix: string = ''): string {
    return color ? prefix + 'text-' + color : '';
}
