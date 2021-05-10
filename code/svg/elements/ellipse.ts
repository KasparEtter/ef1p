/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Box } from '../utility/box';
import { Collector } from '../utility/collector';
import { strokeRadius } from '../utility/constants';
import { Point } from '../utility/point';

import { CenterTextElement } from './center';
import { VisualElementProps } from './element';

export interface EllipseProps extends VisualElementProps {
    center: Point;
    radius: Point;
}

export class Ellipse extends CenterTextElement<EllipseProps> {
    public constructor(
        props: Readonly<EllipseProps>,
    ) {
        super(props);

        if (props.radius.x <= 0 || props.radius.y <= 0) {
            throw Error(`The radius ${props.radius.toString()} has to be positive.`);
        }
    }

    protected _boundingBox({ center, radius }: EllipseProps): Box {
        return new Box(center.subtract(radius), center.add(radius));
    }

    protected _encode(collector: Collector, prefix: string, { center, radius }: EllipseProps): string {
        center = center.round3();
        radius = radius.round3();
        collector.elements.add('ellipse');
        return prefix + `<ellipse${this.attributes(collector)}`
            + ` cx="${center.x}" cy="${center.y}"`
            + ` rx="${radius.x}" ry="${radius.y}">`
            + `${this.children(collector, prefix)}</ellipse>\n`;
    }

    public pointTowards(other: Point, offset: number = strokeRadius): Point {
        const { center, radius } = this.props;
        const vector = other.subtract(center);
        // https://math.stackexchange.com/questions/432902/how-to-get-the-radius-of-an-ellipse-at-a-specific-angle-by-knowing-its-semi-majo
        const angle = Math.atan(vector.y / vector.x);
        const {x, y} = radius;
        const xSin = x * Math.sin(angle);
        const yCos = y * Math.cos(angle);
        const r = x * y / Math.sqrt(xSin * xSin + yCos * yCos);
        return center.add(vector.normalize(r + offset));
    }

    public move(vector: Point): Ellipse {
        return new Ellipse({ ...this.props, center: this.props.center.add(vector) });
    }
}
