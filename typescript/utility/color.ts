export const colors = {
    blue:   '#3498db',
    purple: '#6b38ca',
    pink:   '#e91e7c',
    red:    '#f12812',
    orange: '#fd7e14',
    yellow: '#ffc107',
    green:  '#00bc8c',
    brown:  '#9b7c55',
    gray:   '#808080',
};

export type Color = keyof typeof colors;

export function colorSuffix(color?: Color): string {
    return color ? '-' + color : '';
}

export function textColor(color?: Color, prefix: string = ''): string {
    return color ? prefix + 'text-' + color : '';
}
