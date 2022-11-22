/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { normalizeToArray } from '../../utility/normalization';

import { Box, BoxSide, opposite } from '../utility/box';
import { Collector } from '../utility/collector';
import { strokeRadius, textToLineDistance } from '../utility/constants';
import { Marker, markerAttributes, markerOffset } from '../utility/marker';
import { round6 } from '../utility/math';
import { Point } from '../utility/point';

import { VisualElement, VisualElementProps } from './element';
import { determineAlignment } from './line';
import { Text, TextLine, TextProps } from './text';

export interface ArcProps extends VisualElementProps {
    start: Point;
    startSide: BoxSide;
    end: Point;
    endSide: BoxSide;

    /**
     * Used only if startSide === endSide.
     */
    radius?: number | undefined;

    /**
     * Override the calculated ratio between the point on the arc and the corner for correcting the direction of the arrow.
     * The higher the ratio, the more perpendicular the arrow.
     */
    ratio?: number | undefined;

    marker?: Marker | Marker[] | undefined;
}

export enum Rotation {
    counterclockwise = 0,
    clockwise = 1,
}

export type ArcSide = 'inside' | 'outside';

const epsilon = 0.01;

export class Arc extends VisualElement<ArcProps> {
    public constructor(
        props: Readonly<ArcProps>,
    ) {
        super(props);

        if (opposite(props.startSide, props.endSide)) {
            throw Error(`The start and end side of an arc may not be opposites.`);
        }

        if (props.radius) {
            if (props.startSide !== props.endSide) {
                throw Error(`A radius may only be provided if both sides of the arc are the same.`);
            } else if (props.radius <= 0) {
                throw Error(`The radius of an arc has to be positive.`);
            }
        }

        if (props.startSide === props.endSide) {
            if ((props.startSide === 'top' || props.startSide === 'bottom') && props.start.y !== props.end.y) {
                throw Error(`If an arc starts and ends at the top or bottom, the Y values of the start and end have to be the same.`);
            }
            if ((props.startSide === 'right' || props.startSide === 'left') && props.start.x !== props.end.x) {
                throw Error(`If an arc starts and ends at the right or left, the X values of the start and end have to be the same.`);
            }
        }
    }

    public static connectBoxes(
        startElement: VisualElement,
        startSide: BoxSide,
        endElement: VisualElement,
        endSide: BoxSide,
        props: Omit<ArcProps, 'start' | 'startSide' | 'end' | 'endSide'> = {},
        startOffset?: number,
        endOffset: number | undefined = startOffset,
    ): Arc {
        const marker = normalizeToArray(props.marker ?? 'end');
        // Make sure not to break the arc's invariant.
        if ((startOffset === undefined || endOffset === undefined) && startSide === endSide) {
            if (marker.includes('middle')) {
                startOffset = endOffset = 0;
            } else if (marker.length > 0) {
                startOffset = endOffset = strokeRadius;
            } else {
                startOffset = endOffset = strokeRadius / 4;
            }
        }
        const start = startElement.boundingBox().pointAt(startSide, startOffset ?? markerOffset(marker, 'start'));
        const end = endElement.boundingBox().pointAt(endSide, endOffset ?? markerOffset(marker, 'end'));
        return new Arc({ start, startSide, end, endSide, marker, ...props });
    }

    protected getDefaultRadius(): number {
        const { start, startSide, end } = this.props;
        if (startSide === 'top' || startSide === 'bottom') {
            return Math.abs(end.x - start.x) / 3;
        } else {
            return Math.abs(end.y - start.y) / 3;
        }
    }

    protected _boundingBox({ start, startSide, end, endSide, radius = this.getDefaultRadius() }: ArcProps): Box {
        const boundingBox = Box.around(start, end);
        if (startSide === endSide) {
            switch (startSide) {
                case 'top':
                    return new Box(boundingBox.topLeft.subtractY(radius), boundingBox.bottomRight);
                case 'right':
                    return new Box(boundingBox.topLeft, boundingBox.bottomRight.addX(radius));
                case 'bottom':
                    return new Box(boundingBox.topLeft, boundingBox.bottomRight.addY(radius));
                case 'left':
                    return new Box(boundingBox.topLeft.subtractX(radius), boundingBox.bottomRight);
            }
        } else {
            return boundingBox;
        }
    }

    public radius(): Point {
        const { start, end, radius = this.getDefaultRadius() } = this.props;
        const vector = end.subtract(start).absolute();
        if (vector.x === 0) {
            return new Point(radius, vector.y / 2);
        } else if (vector.y === 0) {
            return new Point(vector.x / 2, radius);
        } else {
            return vector;
        }
    }

    public length(): number {
        const {x, y} = this.radius();
        // Approximation 3 from https://www.mathsisfun.com/geometry/ellipse-perimeter.html.
        const h = ((x - y) * (x - y)) / ((x + y) * (x + y));
        const circumference = Math.PI * (x + y) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h)));
        if (this.props.startSide === this.props.endSide) {
            return circumference / 2;
        } else {
            return circumference / 4;
        }
    }

    protected rotation(): Rotation {
        const { start, startSide, end, endSide } = this.props;
        if (startSide === endSide) {
            const vector = end.subtract(start);
            switch (startSide) {
                case 'top':
                    return vector.x > 0 ? Rotation.clockwise : Rotation.counterclockwise;
                case 'right':
                    return vector.y > 0 ? Rotation.clockwise : Rotation.counterclockwise;
                case 'bottom':
                    return vector.x < 0 ? Rotation.clockwise : Rotation.counterclockwise;
                case 'left':
                    return vector.y < 0 ? Rotation.clockwise : Rotation.counterclockwise;
            }
        } else {
            switch (startSide) {
                case 'top':
                    return endSide === 'left' ? Rotation.clockwise : Rotation.counterclockwise;
                case 'right':
                    return endSide === 'top' ? Rotation.clockwise : Rotation.counterclockwise;
                case 'bottom':
                    return endSide === 'right' ? Rotation.clockwise : Rotation.counterclockwise;
                case 'left':
                    return endSide === 'bottom' ? Rotation.clockwise : Rotation.counterclockwise;
            }
        }
    }

    protected getCenterAndOpposite(): [Point, Point] {
        const { start, startSide, end, endSide, radius = this.getDefaultRadius() } = this.props;
        const rotation = this.rotation();

        // Determine the center of the ellipse and its opposite point on the arc's bounding box.
        let center: Point;
        let opposite: Point;
        if (startSide === endSide) {
            center = start.center(end);
            switch (startSide) {
                case 'top':
                    opposite = center.subtractY(radius);
                    break;
                case 'right':
                    opposite = center.addX(radius);
                    break;
                case 'bottom':
                    opposite = center.addY(radius);
                    break;
                case 'left':
                    opposite = center.subtractX(radius);
                    break;
            }
        } else {
            // Determine the points clockwise and swap afterwards otherwise.
            const direction = end.subtract(start).sign();
            switch (direction.x * direction.y) {
                case 1:
                    center = new Point(start.x, end.y);
                    opposite = new Point(end.x, start.y);
                    break;
                case -1:
                    center = new Point(end.x, start.y);
                    opposite = new Point(start.x, end.y);
                    break;
                default:
                    throw Error(`Unless the start and the end side of the arc are the same, neither the X nor the Y values of the start and end may be the same.`);
            }
            if (rotation === Rotation.counterclockwise) {
                const temporary = center;
                center = opposite;
                opposite = temporary;
            }
        }

        return [center, opposite];
    }

    protected getVectorTowards(center: Point, point: Point): Point {
        // https://math.stackexchange.com/questions/432902/how-to-get-the-radius-of-an-ellipse-at-a-specific-angle-by-knowing-its-semi-majo
        const vector = point.subtract(center);
        const angle = Math.atan(vector.y / vector.x);
        const {x, y} = vector.absolute();
        const xSin = x * Math.sin(angle);
        const yCos = y * Math.cos(angle);
        const r = x * y / Math.sqrt(xSin * xSin + yCos * yCos);
        return vector.normalize(r);
    }

    protected ratio(): number {
        const radius = this.radius().absolute();
        const [larger, smaller] = radius.largerAndSmaller();
        return (1 + smaller / larger + Math.min(radius.length() / 250, 1)) / 3;
    }

    protected adjustStartArrowDirection(): string {
        if (normalizeToArray(this.props.marker).includes('start')) {
            const { start, startSide, end, endSide, ratio } = this.props;
            const [center, opposite] = this.getCenterAndOpposite();
            const corner = startSide === endSide ? opposite.subtract(end.subtract(start).divide(2)) : opposite;
            const vector = this.getVectorTowards(center, corner);
            const direction = start.subtract(center.add(vector).towards(corner, ratio ?? this.ratio()));
            const point = start.add(direction.normalize(epsilon));
            return `${round6(point.x)},${round6(point.y)} L `;
        } else {
            return '';
        }
    }

    protected adjustEndArrowDirection(): string {
        if (normalizeToArray(this.props.marker).includes('end')) {
            const { start, startSide, end, endSide, ratio } = this.props;
            const [center, opposite] = this.getCenterAndOpposite();
            const corner = startSide === endSide ? opposite.add(end.subtract(start).divide(2)) : opposite;
            const vector = this.getVectorTowards(center, corner);
            const direction = end.subtract(center.add(vector).towards(corner, ratio ?? this.ratio()));
            const point = end.add(direction.normalize(epsilon));
            return ` L ${round6(point.x)},${round6(point.y)}`;
        } else {
            return '';
        }
    }

    protected _encode(collector: Collector, prefix: string, { start, end, marker, color }: ArcProps): string {
        const {x, y} = this.radius().round3(); // This rounding (and numeric imprecision) could introduce problems in case of half ellipses.
        collector.elements.add('path');
        return prefix + `<path${this.attributes(collector)}`
            + ` d="M ${this.adjustStartArrowDirection()}${start.encode()} A ${x} ${y} 0 0 ${this.rotation()} ${end.encode()}${this.adjustEndArrowDirection()}"`
            + markerAttributes(collector, this.length.bind(this), marker, color)
            + `>${this.children(collector, prefix)}</path>\n`;
    }

    public text(
        text: TextLine | TextLine[],
        side: ArcSide = 'outside',
        distance: number = textToLineDistance,
        props: Omit<TextProps, 'position' | 'text'> = {},
    ): Text {
        const { startSide, endSide, color } = this.props;
        const [center, opposite] = this.getCenterAndOpposite();
        const vector = startSide === endSide ? opposite.subtract(center) : this.getVectorTowards(center, opposite);

        // Determine the position on the desired arc side.
        let offset = vector.normalize(distance);
        if (side === 'inside') {
            offset = offset.invert();
        }
        const position = center.add(vector).add(offset);

        return new Text({ position, text, ...determineAlignment(offset), color, ...props });
    }

    public withText(
        text: TextLine | TextLine[],
        side: ArcSide = 'outside',
        distance: number = textToLineDistance,
        props: Omit<TextProps, 'position' | 'text'> = {},
    ): [this, Text] {
        return [this, this.text(text, side, distance, props)];
    }

    public move(vector: Point): Arc {
        return new Arc({ ...this.props, start: this.props.start.add(vector), end: this.props.end.add(vector) });
    }
}
