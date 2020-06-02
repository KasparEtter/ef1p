import { normalizeToArray } from '../../utility/functions';

import { Color, colorSuffix } from './color';
import { strokeRadius } from './constants';

export type Marker = 'start' | 'middle' | 'end';

export function markerOffset(marker: undefined | Marker | Marker[], side: Exclude<Marker, 'middle'>): number {
    marker = normalizeToArray(marker);
    return marker.includes('middle') && !marker.includes(side) ? 0 : strokeRadius;
}

export function markerAttributes(length: () => number, marker?: Marker | Marker[], color?: Color, midMarker: boolean = false): string {
    let result = '';
    marker = normalizeToArray(marker);
    if (marker.length > 0) {
        const arrow = `"url(#arrow${colorSuffix(color)})"`;
        const circle = `"url(#circle${colorSuffix(color)})"`;
        let arrowCounter = 0;

        if (marker.includes('start')) {
            result += ' marker-start=' + arrow;
            arrowCounter++;
        } else if (marker.includes('middle')) {
            result += ' marker-start=' + circle;
        }

        if (midMarker && marker.includes('middle')) {
            result += ' marker-mid=' + circle;
        }

        if (marker.includes('end')) {
            result += ' marker-end=' + arrow;
            arrowCounter++;
        } else if (marker.includes('middle')) {
            result += ' marker-end=' + circle;
        }

        if (arrowCounter > 0) {
            const pixels = 7; // Should be between 4 and 10. (For a stroke width of 4, 10 was a good value.)
            const reducedLength = Math.round(length()) - arrowCounter * pixels;
            result += ` stroke-dasharray="${reducedLength}"`;
            if (marker.includes('start')) {
                result += ` stroke-dashoffset="${2 * reducedLength - pixels}"`; // Safari doesn't support negative dash offsets.
            }
        }
    }
    return result;
}
