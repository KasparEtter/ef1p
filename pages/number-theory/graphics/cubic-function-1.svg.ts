/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { plotCubicFunction } from './cubic-function';

function curve(x: number): number {
    return x * x * x + x * x + x + 1;
}

function derivative1(x: number): number {
    return 3 * x * x + 2 * x + 1;
}

function derivative2(x: number): number {
    return 6 * x + 2;
}

plotCubicFunction(curve, derivative1, derivative2, [-1], -1.7, 0.75);
