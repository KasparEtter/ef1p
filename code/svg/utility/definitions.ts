/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color, getColorSuffix } from '../../utility/color';

import { indentation } from './constants';

export function getArrowMarkers(colors: Iterable<Color | undefined>, prefix: string): string {
    let result = '';
    for (const color of colors) {
        result += prefix + `<marker id="arrow${getColorSuffix(color)}" orient="auto-start-reverse" markerWidth="4" markerHeight="4" refX="4" refY="2">\n`;
        result += prefix + indentation + `<path d="M0,0 L1,2 L0,4 L4,2 Z"${color ? ` class="${color}"` : ''} />\n`;
        result += prefix + `</marker>\n`;
    }
    return result;
}

export function getCircleMarkers(colors: Iterable<Color | undefined>, prefix: string): string {
    let result = '';
    for (const color of colors) {
        result += prefix + `<marker id="circle${getColorSuffix(color)}" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5">\n`;
        result += prefix + indentation + `<circle cx="1.5" cy="1.5" r="1"${color ? ` class="${color}"` : ''} />\n`;
        result += prefix + `</marker>\n`;
    }
    return result;
}
