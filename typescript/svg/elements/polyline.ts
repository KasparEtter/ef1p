import { Box, BoxSide } from '../utility/box';
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

    public length(): number {
        let length = 0;
        const points = this.props.points;
        for (let i = 1; i < points.length; i++) {
            length += points[i - 1].distanceTo(points[i]);
        }
        return length;
    }

    protected _boundingBox({ points }: PolylineProps): Box {
        const min = points.reduce((previous, current) => previous.min(current), points[0]);
        const max = points.reduce((previous, current) => previous.max(current), points[0]);
        return new Box(min, max);
    }

    protected _encode(prefix: string, { points, marker, color }: PolylineProps): string {
        return prefix + `<polyline${this.attributes()}`
            + ` points="${points.map(point => point.round3().encode()).join(' ')}"`
            + markerAttributes(this.length.bind(this), marker, color, true)
            + `>${this.children(prefix)}</polyline>\n`;
    }
}

export function ConnectionPolyline(
    startElement: VisualElement,
    startSide: BoxSide,
    endElement: VisualElement,
    endSide: BoxSide,
    intermediatePoints: Point[],
    props: Omit<PolylineProps, 'points'> = {},
): Polyline {
    if (intermediatePoints.length < 1) {
        throw Error('A polyline requires at least one intermediate point.');
    }
    const marker = props.marker ?? 'end';
    const start = startElement.boundingBox().pointAt(startSide, markerOffset(marker, 'start'));
    const end = endElement.boundingBox().pointAt(endSide, markerOffset(marker, 'end'));
    return new Polyline({ points: [start, ...intermediatePoints, end], marker, ...props });
}

export function DiagonalPolyline(
    startElement: Circle | Ellipse,
    endElement: Circle | Ellipse,
    intermediatePoints: Point[],
    props: Omit<PolylineProps, 'points'> = {},
): Polyline {
    if (intermediatePoints.length < 1) {
        throw Error('A polyline requires at least one intermediate point.');
    }
    const marker = props.marker ?? 'end';
    const start = startElement.pointTowards(intermediatePoints[0], markerOffset(marker, 'start'));
    const end = endElement.pointTowards(intermediatePoints[intermediatePoints.length - 1], markerOffset(marker, 'end'));
    return new Polyline({ points: [start, ...intermediatePoints, end], marker, ...props });
}
