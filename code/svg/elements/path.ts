/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Box } from '../utility/box';
import { Collector } from '../utility/collector';

import { VisualElement, VisualElementProps } from './element';

export interface PathProps extends VisualElementProps {
    path: string;
    boundingBox: Box;
}

export class Path extends VisualElement<PathProps> {
    public constructor(
        props: Readonly<PathProps>,
    ) {
        super(props);
    }

    protected _boundingBox({ boundingBox }: PathProps): Box {
        return boundingBox;
    }

    protected _encode(collector: Collector, prefix: string, { path }: PathProps): string {
        collector.elements.add('path');
        return prefix + `<path${this.attributes(collector)}`
            + ` d="${path}"`
            + `>${this.children(collector, prefix)}</path>\n`;
    }
}
