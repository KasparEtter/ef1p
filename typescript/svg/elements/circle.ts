import { Box } from '../utility/box';
import { strokeRadius } from '../utility/constants';
import { Point } from '../utility/point';
import { round3 } from '../utility/rounding';

import { CenterTextElement } from './center';
import { Collector, VisualElementProps } from './element';

export interface CircleProps extends VisualElementProps {
    center: Point;
    radius: number;
}

export class Circle extends CenterTextElement<CircleProps> {
    public constructor(
        props: Readonly<CircleProps>,
    ) {
        super(props);

        if (props.radius <= 0) {
            throw Error(`The radius ${props.radius} has to be positive.`);
        }
    }

    protected _boundingBox({ center, radius }: CircleProps): Box {
        const vector = new Point(radius, radius);
        return new Box(center.subtract(vector), center.add(vector));
    }

    protected _encode(collector: Collector, prefix: string, { center, radius }: CircleProps): string {
        center = center.round3();
        radius = round3(radius);
        collector.elements.add('circle');
        return prefix + `<circle${this.attributes(collector)}`
            + ` cx="${center.x}" cy="${center.y}"`
            + ` r="${radius}">`
            + `${this.children(collector, prefix)}</circle>\n`;
    }

    public pointTowards(target: Point, offset: number = strokeRadius): Point {
        const { center, radius } = this.props;
        return center.add(target.subtract(center).normalize(radius + offset));
    }
}
