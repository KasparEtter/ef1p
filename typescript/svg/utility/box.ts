import { strokeRadius } from './constants';
import { Point } from './point';

export type BoxSide = 'top' | 'right' | 'bottom' | 'left';

export function opposite(a: BoxSide, b: BoxSide): boolean {
    return a === 'top' && b === 'bottom'
        || a === 'right' && b === 'left'
        || a === 'bottom' && b === 'top'
        || a === 'left' && b === 'right';
}

export class Box {
    public constructor(
        public readonly topLeft: Point,
        public readonly bottomRight: Point,
    ) {
        if (topLeft.x > bottomRight.x || topLeft.y > bottomRight.y) {
            throw Error(`The top left point ${topLeft.toString()} has to be to the top and the left of the bottom right point ${bottomRight.toString()}.`);
        }
    }

    public size(): Point {
        return this.bottomRight.subtract(this.topLeft);
    }

    public center(): Point {
        return this.topLeft.center(this.bottomRight);
    }

    public encompass(that: Box): Box {
        return new Box(this.topLeft.min(that.topLeft), this.bottomRight.max(that.bottomRight));
    }

    public addMargin(that: Point): Box {
        return new Box(this.topLeft.subtract(that), this.bottomRight.add(that));
    }

    public pointAt(side: BoxSide, offset: number = strokeRadius): Point {
        const center = this.topLeft.center(this.bottomRight);
        switch (side) {
            case 'top':
                return new Point(center.x, this.topLeft.y - offset);
            case 'right':
                return new Point(this.bottomRight.x + offset, center.y);
            case 'bottom':
                return new Point(center.x, this.bottomRight.y + offset);
            case 'left':
                return new Point(this.topLeft.x - offset, center.y);
        }
    }

    public toString(): string {
        return `[${this.topLeft.toString()}, ${this.bottomRight.toString()}]`;
    }
}

export function BoundingBox(point1: Point, point2: Point): Box {
    return new Box(point1.min(point2), point1.max(point2));
}
