import { degrees, round3 } from './math';
import { Point } from './point';

export function rotate(direction: Point, position: Point): string {
    return `rotate(${round3(degrees(direction.angle()))}, ${round3(position.x)}, ${round3(position.y)})`;
}
