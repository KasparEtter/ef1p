/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Box } from '../utility/box';
import { Collector } from '../utility/collector';
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

    protected _encode(collector: Collector, prefix: string, { points }: PolygonProps): string {
        collector.elements.add('polygon');
        return prefix + `<polygon${this.attributes(collector)}`
            + ` points="${points.map(point => point.round3().encode()).join(' ')}">`
            + `${this.children(collector, prefix)}</polygon>\n`;
    }

    public move(vector: Point): Polygon {
        return new Polygon({ ...this.props, points: this.props.points.map(point => point.add(vector)) });
    }
}
