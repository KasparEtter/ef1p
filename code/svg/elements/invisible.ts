import { Box } from '../utility/box';
import { Point } from '../utility/point';

import { VisualElement, VisualElementProps } from './element';

// Invisible point to include in the overall bounding box

export interface InvisiblePointProps extends VisualElementProps {
    point: Point;
}

export class InvisiblePoint extends VisualElement<InvisiblePointProps> {
    protected _boundingBox({ point }: InvisiblePointProps): Box {
        return new Box(point, point);
    }

    protected _encode(): string {
        return '';
    }
}
