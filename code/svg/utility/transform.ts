/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { round3 } from './math';
import { Point } from './point';

export function rotate(centerOfRotation: Point, angleInDegrees: number): string {
    return `rotate(${round3(angleInDegrees)}, ${round3(centerOfRotation.x)}, ${round3(centerOfRotation.y)})`;
}
