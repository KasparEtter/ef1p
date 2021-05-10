/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { degrees, round3 } from './math';
import { Point } from './point';

export function rotate(direction: Point, position: Point): string {
    return `rotate(${round3(degrees(direction.angle()))}, ${round3(position.x)}, ${round3(position.y)})`;
}
