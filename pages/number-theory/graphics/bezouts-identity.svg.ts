/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeWidth, textToLineDistance } from '../../../code/svg/utility/constants';

export const a = 6;
export const b = 10;
export const max = 14;
export const gcd = 2;

export const scale = 36;
export const arrowOffset = 3 * strokeWidth;
export const dashRadius = arrowOffset;
export const textOffset = dashRadius + textToLineDistance;
