import { Color } from '../../utility/color';

import { BoundingBox, Box, BoxSide } from '../utility/box';
import { Collector } from '../utility/collector';
import { textToLineDistance } from '../utility/constants';
import { Marker, markerAttributes, markerOffset } from '../utility/marker';
import { LineSide, Point } from '../utility/point';

import { Circle } from './circle';
import { VisualElement, VisualElementProps } from './element';
import { Ellipse } from './ellipse';
import { Alignment, HorizontalAlignment, Text, TextLine, TextProps, VerticalAlignment } from './text';

export function determineAlignment(offset: Point): Alignment {
    const absoluteOffset = offset.absolute();
    let horizontalAlignment: HorizontalAlignment;
    if (absoluteOffset.y > absoluteOffset.x * 4) {
        horizontalAlignment = 'center';
    } else if (offset.x > 0) {
        horizontalAlignment = 'left';
    } else {
        horizontalAlignment = 'right';
    }
    let verticalAlignment: VerticalAlignment;
    if (absoluteOffset.x > absoluteOffset.y * 4) {
        verticalAlignment = 'center';
    } else if (offset.y > 0) {
        verticalAlignment = 'top';
    } else {
        verticalAlignment = 'bottom';
    }
    return { horizontalAlignment, verticalAlignment };
}

export interface LineProps extends VisualElementProps {
    start: Point;
    end: Point;
    marker?: Marker | Marker[];
}

export class Line extends VisualElement<LineProps> {
    public vector(): Point {
        return this.props.end.subtract(this.props.start);
    }

    public length(): number {
        return this.vector().length();
    }

    protected _boundingBox({ start, end }: LineProps): Box {
        return BoundingBox(start, end);
    }

    protected _encode(collector: Collector, prefix: string, {
        start,
        end,
        marker,
        color,
    }: LineProps): string {
        start = start.round3();
        end = end.round3();
        collector.elements.add('line');
        return prefix + `<line${this.attributes(collector)}`
            + ` x1="${start.x}"`
            + ` y1="${start.y}"`
            + ` x2="${end.x}"`
            + ` y2="${end.y}"`
            + markerAttributes(collector, this.length.bind(this), marker, color)
            + `>${this.children(collector, prefix)}</line>\n`;
    }

    public text(
        text: TextLine | TextLine[],
        side: LineSide = 'left',
        distance: number = textToLineDistance,
        // Horizontal and vertical alignment are intentionally not excluded because the defaults should be overridable.
        props: Omit<TextProps, 'position' | 'text'> = {},
    ): Text {
        const offset = this.vector().rotate(side).normalize(distance);
        const position = this.center().add(offset);
        const color = this.props.color;
        return new Text({ position, text, ...determineAlignment(offset), color, ...props });
    }

    public move(vector: Point): Line {
        const start = this.props.start.add(vector);
        const end = this.props.end.add(vector);
        return new Line({ ...this.props, start, end }); // Overriding old start and end properties.
    }

    public shorten(startOffset: number, endOffset: number = startOffset): Line {
        const vector = this.vector();
        const start = this.props.start.add(vector.normalize(startOffset));
        const end = this.props.end.subtract(vector.normalize(endOffset));
        return new Line({ ...this.props, start, end }); // Overriding old start and end properties.
    }

    public cross(radius: number = 10, color: Color | undefined = this.props.color): Line[] {
        const center = this.center();
        const vector = this.vector();
        const angle = Math.atan(vector.y / vector.x);
        const step = Math.PI / 4;
        return [
            new Line({ start: center.point(radius, angle + step * 1), end: center.point(radius, angle + step * 5), color }),
            new Line({ start: center.point(radius, angle + step * 3), end: center.point(radius, angle + step * 7), color }),
        ]
    }
}

export function ConnectionLine(
    startElement: VisualElement,
    startSide: BoxSide,
    endElement: VisualElement,
    endSide: BoxSide,
    props: Omit<LineProps, 'start' | 'end'> = {},
): Line {
    const marker = props.marker ?? 'end';
    const start = startElement.boundingBox().pointAt(startSide, markerOffset(marker, 'start'));
    const end = endElement.boundingBox().pointAt(endSide, markerOffset(marker, 'end'));
    return new Line({ start, end, marker, ...props });
}

export function DiagonalLine(
    startElement: Circle | Ellipse,
    endElement: Circle | Ellipse,
    props: Omit<LineProps, 'start' | 'end'> = {},
): Line {
    const marker = props.marker ?? 'end';
    const start = startElement.pointTowards(endElement.center(), markerOffset(marker, 'start'));
    const end = endElement.pointTowards(startElement.center(), markerOffset(marker, 'end'));
    return new Line({ start, end, marker, ...props });
}
