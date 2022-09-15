/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { Arc } from '../../../code/svg/elements/arc';
import { Line } from '../../../code/svg/elements/line';

import { dashRadius, dlpElements, gap, k, n, radius, ratio } from './dlp';

export const giantStepLeftElements = dlpElements;

export const s = 4;

for (let i = 1; i <= n; i++) {
    if (i < s) {
        giantStepLeftElements.unshift(new Arc({
            start: P(i * gap, -dashRadius),
            startSide: 'top',
            end: P((i + 1) * gap, -dashRadius),
            endSide: 'top',
            radius,
            ratio,
            marker: 'end',
            color: 'green',
        }));
    }
    if (i < k && i % s === k % s) {
        giantStepLeftElements.push(new Arc({
            start: P((i + s) * gap, -dashRadius),
            startSide: 'top',
            end: P(i * gap, -dashRadius),
            endSide: 'top',
            radius: radius * 2.6,
            marker: 'end',
            color: 'blue',
        }));
    }
    giantStepLeftElements.push(new Line({
        start: P(i * gap, -dashRadius),
        end: P(i * gap, dashRadius),
        color: i === k ? 'pink' : i <= s ? 'green' : undefined,
    }));
}
