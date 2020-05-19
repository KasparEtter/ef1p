import { Box } from '../utility/box';
import { Point } from '../utility/point';

import { CenterTextElement } from './center';
import { VisualElementProps } from './element';

export interface PolygonProps extends VisualElementProps {
    points: Point[];
}

export class Polygon extends CenterTextElement<PolygonProps> {
    public constructor(
        props: Readonly<PolygonProps>,
    ) {
        super(props);

        if (props.points.length < 3) {
            throw Error(`A polygon requires at least three points.`);
        }
    }

    protected _boundingBox({ points }: PolygonProps): Box {
        const min = points.reduce((previous, current) => previous.min(current), points[0]);
        const max = points.reduce((previous, current) => previous.max(current), points[0]);
        return new Box(min, max);
    }

    protected _encode(prefix: string, { points }: PolygonProps): string {
        return prefix + `<polygon${this.attributes()}`
            + ` points="${points.map(point => point.round3().encode()).join(' ')}">`
            + `${this.children(prefix)}</polygon>\n`;
    }
}
