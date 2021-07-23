/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { radiansToDegrees, round3 } from './math';

export type LineSide = 'left' | 'right';

export class Point {
    public constructor(
        public readonly x: number,
        public readonly y: number,
    ) {}

    public static max(points: Point[]): Point {
        return points.reduce((previousSize, currentSize) => previousSize.max(currentSize), zeroPoint);
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(length: number): Point {
        return this.divide(this.length()).multiply(length);
    }

    public round(): Point {
        return new Point(Math.round(this.x), Math.round(this.y));
    }

    public round3(): Point {
        return new Point(round3(this.x), round3(this.y));
    }

    public absolute(): Point {
        return new Point(Math.abs(this.x), Math.abs(this.y));
    }

    public sign(): Point {
        return new Point(Math.sign(this.x), Math.sign(this.y));
    }

    public invert(): Point {
        return new Point(-this.x, -this.y);
    }

    public invertX(): Point {
        return new Point(-this.x, this.y);
    }

    public invertY(): Point {
        return new Point(this.x, -this.y);
    }

    public add(that: Point): Point {
        return new Point(this.x + that.x, this.y + that.y);
    }

    public addX(value: number): Point {
        return new Point(this.x + value, this.y);
    }

    public addY(value: number): Point {
        return new Point(this.x, this.y + value);
    }

    public subtract(that: Point): Point {
        return new Point(this.x - that.x, this.y - that.y);
    }

    public subtractX(value: number): Point {
        return new Point(this.x - value, this.y);
    }

    public subtractY(value: number): Point {
        return new Point(this.x, this.y - value);
    }

    public multiply(factor: number): Point {
        return new Point(this.x * factor, this.y * factor);
    }

    public multiplyX(factor: number): Point {
        return new Point(this.x * factor, this.y);
    }

    public multiplyY(factor: number): Point {
        return new Point(this.x, this.y * factor);
    }

    public divide(factor: number): Point {
        return new Point(this.x / factor, this.y / factor);
    }

    public divideX(factor: number): Point {
        return new Point(this.x / factor, this.y);
    }

    public divideY(factor: number): Point {
        return new Point(this.x, this.y / factor);
    }

    public min(that: Point): Point {
        return new Point(Math.min(this.x, that.x), Math.min(this.y, that.y));
    }

    public max(that: Point): Point {
        return new Point(Math.max(this.x, that.x), Math.max(this.y, that.y));
    }

    public center(that: Point): Point {
        return new Point((this.x + that.x) / 2, (this.y + that.y) / 2);
    }

    public distanceTo(that: Point): number {
        return that.subtract(this).length();
    }

    /**
     * Creates the given number of evenly spaced points from this point to that point (including both).
     */
    public space(that: Point, amount: number): Point[] {
        if (amount < 2) {
            throw Error(`The number of points has to be at least two but was ${amount}.`);
        }
        const step = that.subtract(this).divide(amount - 1);
        const points: Point[] = new Array(amount);
        for (let i = 0; i < amount; i++) {
            points[i] = this.add(step.multiply(i));
        }
        return points;
    }

    /**
     * Returns the point at the given distance and angle from this point.
     */
    public point(distance: number, angle: number): Point {
        return new Point(this.x + Math.cos(angle) * distance, this.y + Math.sin(angle) * distance);
    }

    /**
     * Creates the given number of evenly spaced points in a circle with the given radius around this point.
     */
    public radial(radius: number, amount: number, offsetAngle: number = -Math.PI / 2): Point[] {
        const angle = Math.PI * 2 / amount;
        const points: Point[] = new Array(amount);
        for (let i = 0; i < amount; i++) {
            points[i] = this.point(radius, offsetAngle + i * angle);
        }
        return points;
    }

    /**
     * Rotates this vector by 90 degrees.
     */
    public rotate(side: LineSide): Point {
        const factor = side === 'right' ? 1 : -1; // The y-axis points downwards.
        return new Point(-this.y * factor, this.x * factor);
    }

    /**
     * Returns the angle of this vector in radians.
     */
    public angleInRadians(): number {
        return Math.atan(this.y / this.x);
    }

    /**
     * Returns the angle of this vector in degrees.
     */
    public angleInDegrees(): number {
        return radiansToDegrees(this.angleInRadians());
    }

    public encode(): string {
        return `${this.x},${this.y}`;
    }

    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}

export function P(x: number, y: number): Point {
    return new Point(x, y);
}

export const zeroPoint = new Point(0, 0);
