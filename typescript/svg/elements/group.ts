import { ElementWithChildren, StructuralElement, StructuralElementProps } from './element';

export class Group extends StructuralElement<StructuralElementProps> {
    protected _encode(prefix: string): string {
        return prefix + `<g${this.attributes()}>${this.children(prefix)}</g>\n`;
    }
}

export function G(...children: ElementWithChildren<any, any>[]): Group {
    return new Group({ children });
}
