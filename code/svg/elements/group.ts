/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Collector } from '../utility/collector';

import { ElementWithChildren, StructuralElement, StructuralElementProps } from './element';

export class Group extends StructuralElement<StructuralElementProps> {
    protected _encode(collector: Collector, prefix: string): string {
        collector.elements.add('g');
        return prefix + `<g${this.attributes(collector)}>${this.children(collector, prefix)}</g>\n`;
    }
}

export function G(...children: ElementWithChildren<any, any>[]): Group {
    return new Group({ children });
}
