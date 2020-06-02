export const colors = [undefined, 'blue', 'green', 'red', 'orange', 'grey'] as const;
export type Color = typeof colors[number];

export function colorSuffix(color?: Color) {
    return color ? '-' + color : '';
}
