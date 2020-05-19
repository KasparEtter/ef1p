import { Box } from '../utility/box';
import { Point } from '../utility/point';

import { CenterTextElement } from './center';
import { VisualElementProps } from './element';

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

    protected _encode(prefix: string, { center, radius }: CircleProps): string {
        center = center.round3();
        radius = Math.round(radius * 1000) / 1000;
        return prefix + `<circle${this.attributes()}`
            + ` cx="${center.x}" cy="${center.y}"`
            + ` r="${radius}">`
            + `${this.children(prefix)}</circle>\n`;
    }
}
