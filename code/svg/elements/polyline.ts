/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Box, BoxSide } from '../utility/box';
import { Collector } from '../utility/collector';
import { Marker, markerAttributes, markerOffset } from '../utility/marker';
import { Point } from '../utility/point';

import { Circle } from './circle';
import { VisualElement, VisualElementProps } from './element';
import { Ellipse } from './ellipse';

export interface PolylineProps extends VisualElementProps {
    points: Point[];
    marker?: Marker | Marker[];
}

export class Polyline extends VisualElement<PolylineProps> {
    public constructor(
        props: Readonly<PolylineProps>,
    ) {
        super(props);

        if (props.points.length < 3) {
            throw Error('A polyline requires at least three points.');
        }
    }

    public static connectBoxes(
        startElement: VisualElement,
        startSide: BoxSide,
        endElement: VisualElement,
        endSide: BoxSide,
        intermediatePoints: Point[],
        props: Omit<PolylineProps, 'points'> = {},
        startOffset?: number,
        endOffset: number | undefined = startOffset,
    ): Polyline {
        if (intermediatePoints.length < 1) {
            throw Error('A polyline requires at least one intermediate point.');
        }
        const marker = props.marker ?? 'end';
        const start = startElement.boundingBox().pointAt(startSide, startOffset ?? markerOffset(marker, 'start'));
        const end = endElement.boundingBox().pointAt(endSide, endOffset ?? markerOffset(marker, 'end'));
        return new Polyline({ points: [start, ...intermediatePoints, end], marker, ...props });
    }

    public static connectEllipses(
        startElement: Circle | Ellipse,
        endElement: Circle | Ellipse,
        intermediatePoints: Point[],
        props: Omit<PolylineProps, 'points'> = {},
        startOffset?: number,
        endOffset: number | undefined = startOffset,
    ): Polyline {
        if (intermediatePoints.length < 1) {
            throw Error('A polyline requires at least one intermediate point.');
        }
        const marker = props.marker ?? 'end';
        const start = startElement.pointTowards(intermediatePoints[0], startOffset ?? markerOffset(marker, 'start'));
        const end = endElement.pointTowards(intermediatePoints[intermediatePoints.length - 1], endOffset ?? markerOffset(marker, 'end'));
        return new Polyline({ points: [start, ...intermediatePoints, end], marker, ...props });
    }

    protected _boundingBox({ points }: PolylineProps): Box {
        const min = points.reduce((previous, current) => previous.min(current), points[0]);
        const max = points.reduce((previous, current) => previous.max(current), points[0]);
        return new Box(min, max);
    }

    public length(): number {
        let length = 0;
        const points = this.props.points;
        for (let i = 1; i < points.length; i++) {
            length += points[i - 1].distanceTo(points[i]);
        }
        return length;
    }

    protected _encode(collector: Collector, prefix: string, { points, marker, color }: PolylineProps): string {
        collector.elements.add('polyline');
        return prefix + `<polyline${this.attributes(collector)}`
            + ` points="${points.map(point => point.round3().encode()).join(' ')}"`
            + markerAttributes(collector, this.length.bind(this), marker, color, true)
            + `>${this.children(collector, prefix)}</polyline>\n`;
    }

    public move(vector: Point): Polyline {
        return new Polyline({ ...this.props, points: this.props.points.map(point => point.add(vector)) });
    }
}
