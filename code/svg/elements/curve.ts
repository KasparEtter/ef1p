/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { boundingBox, Box } from '../utility/box';
import { Collector } from '../utility/collector';
import { textToLineDistance } from '../utility/constants';
import { Marker, markerAttributes } from '../utility/marker';
import { length, LineSide, Point } from '../utility/point';

import { VisualElement, VisualElementProps } from './element';
import { determineAlignment } from './line';
import { Text, TextLine, TextProps } from './text';

export interface CurveProps extends VisualElementProps {
    start: Point;
    control: Point;
    end: Point;
    marker?: Marker | Marker[];
}

/**
 * Quadratic Bézier curve with a single control point.
 */
export class Curve extends VisualElement<CurveProps> {
    public constructor(
        props: Readonly<CurveProps>,
    ) {
        super(props);
    }

    /**
     * Returns n + 1 points.
     */
    public parameterize(n: number): Point[] {
        const points = new Array<Point>();
        const d = 1 / n;
        const { start, control, end } = this.props;
        points.push(start);
        for (let i = 1; i < n; i++) {
            const t = i * d;
            const s = 1 - t;
            points.push(new Point(s*s*start.x + 2*s*t*control.x + t*t*end.x, s*s*start.y + 2*s*t*control.y + t*t*end.y));
        }
        points.push(end);
        return points;
    }

    protected _boundingBox(): Box {
        return boundingBox(this.parameterize(20));
    }

    public length(): number {
        return length(this.parameterize(20));
    }

    protected _encode(collector: Collector, prefix: string, { start, control, end, marker, color }: CurveProps): string {
        collector.elements.add('path');
        return prefix + `<path${this.attributes(collector)}`
            + ` d="M ${start.encode()} Q ${control.encode()} ${end.encode()}"`
            + markerAttributes(collector, this.length.bind(this), marker, color)
            + `>${this.children(collector, prefix)}</path>\n`;
    }

    public text(
        text: TextLine | TextLine[],
        side: LineSide = 'left',
        distance: number = textToLineDistance,
        props: Omit<TextProps, 'position' | 'text'> = {},
    ): Text {
        const { start, control, end, color } = this.props;
        const p1 = start.center(control);
        const p2 = control.center(end);
        const offset = p2.subtract(p1).rotate(side).normalize(distance);
        const position = p1.center(p2).add(offset);
        return new Text({ position, text, ...determineAlignment(offset), color, ...props });
    }

    public withText(
        text: TextLine | TextLine[],
        side: LineSide = 'left',
        distance: number = textToLineDistance,
        props: Omit<TextProps, 'position' | 'text'> = {},
    ): [this, Text] {
        return [this, this.text(text, side, distance, props)];
    }

    public move(vector: Point): Curve {
        return new Curve({ ...this.props, start: this.props.start.add(vector), control: this.props.control.add(vector), end: this.props.end.add(vector) });
    }
}
