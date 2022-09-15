/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { round3 } from '../../../code/svg/utility/math';
import { P } from '../../../code/svg/utility/point';

import { Box } from '../../../code/svg/utility/box';

export const radius = 60;
export const distance = radius;

export const pointX = radius + distance / 2;
export const pointY = round3(Math.sqrt(radius * radius - distance * distance / 4));

export const boundingBox = new Box(P(-pointX, -radius), P(pointX, radius));

export function getPath(inner: boolean): string {
    return `M 0 ${-pointY} `
        + `A ${radius} ${radius} 0 ${inner ? '0' : '1'} 1 0 ${pointY} `
        + `A ${radius} ${radius} 0 ${inner ? '0' : '1'} 1 0 ${-pointY} Z`;
}
