import { Color, colorSuffix } from '../../utility/color';
import { normalizeToArray } from '../../utility/functions';

import { Collector } from './collector';
import { strokeRadius } from './constants';

export type Marker = 'start' | 'middle' | 'end';

export function markerOffset(
    marker: undefined | Marker | Marker[],
    side: Exclude<Marker, 'middle'>,
): number {
    marker = normalizeToArray(marker);
    if (marker.includes(side)) {
        return strokeRadius; // Arrow
    } else if (marker.includes(side)) {
        return 0; // Circle
    } else {
        return strokeRadius / 4; // None
    }
}

export function markerAttributes(
    collector: Collector,
    length: () => number,
    marker?: Marker | Marker[],
    color?: Color,
    midMarker: boolean = false,
): string {
    let result = '';
    marker = normalizeToArray(marker);
    if (marker.length > 0) {
        const arrow = `"url(#arrow${colorSuffix(color)})"`;
        const circle = `"url(#circle${colorSuffix(color)})"`;
        let arrowCounter = 0;

        if (marker.includes('start')) {
            result += ' marker-start=' + arrow;
            collector.arrows.add(color);
            arrowCounter++;
        } else if (marker.includes('middle')) {
            result += ' marker-start=' + circle;
            collector.circles.add(color);
        }

        if (midMarker && marker.includes('middle')) {
            result += ' marker-mid=' + circle;
            collector.circles.add(color);
        }

        if (marker.includes('end')) {
            result += ' marker-end=' + arrow;
            collector.arrows.add(color);
            arrowCounter++;
        } else if (marker.includes('middle')) {
            result += ' marker-end=' + circle;
            collector.circles.add(color);
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
