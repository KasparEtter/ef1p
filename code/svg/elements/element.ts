import { Color } from '../../utility/color';
import { filterUndefined, normalizeToArray } from '../../utility/functions';

import { Box, EncompassAll } from '../utility/box';
import { Collector, createEmptyCollector } from '../utility/collector';
import { indentation } from '../utility/constants';
import { Point } from '../utility/point';

// Element

export abstract class Element<P = object> {
    public constructor(public readonly props: Readonly<P>) {}

    protected abstract _encode(collector: Collector, prefix: string, props: Readonly<P>): string;

    public encode(collector: Collector, prefix: string): string {
        return this._encode(collector, prefix, this.props);
    }

    public toString(): string {
        return this.encode(createEmptyCollector(), '');
    }
}

// AnimationElement

export abstract class AnimationElement<P = {}> extends Element<P> {}

// ElementWithChildren

export interface ElementWithChildrenProps<C extends Element> {
    id?: string;
    color?: Color;
    style?: string;
    classes?: string | string[];
    children?: C[];
    transform?: string; // Transformations don't affect the bounding box!
    ignoreForClipping?: boolean; // Set to true to ignore the bounding box for clipping.
}

export abstract class ElementWithChildren<C extends Element, P extends ElementWithChildrenProps<C>> extends Element<P> {
    protected abstract _boundingBox(props: Readonly<P>): Box;

    /**
     * Returns the bounding box of this element ignoring any transformations.
     */
    public boundingBox(): Box {
        return this._boundingBox(this.props);
    }

    /**
     * Returns the optional clipping box of this element ignoring any transformations.
     */
    public clippingBox(): Box | undefined {
        return this.props.ignoreForClipping ? undefined : this.boundingBox();
    }

    protected attributes(collector: Collector): string {
        const props = this.props;
        let classes: string[] = normalizeToArray(props.classes);
        const color: Color | undefined = props.color;
        if (color) {
            classes = [color, ...classes]; // classes.unshift(color) would modify the property itself.
        }
        classes.forEach(className => collector.classes.add(className));
        return (props.id ? ` id="${props.id}"` : '')
            + (props.style ? ` style="${props.style}"` : '')
            + (classes.length > 0 ? ` class="${classes.join(' ')}"` : '')
            + (props.transform ? ` transform="${props.transform}"` : '');
    }

    protected children(collector: Collector, prefix: string): string {
        const children = this.props.children;
        let result = '';
        if (children) {
            result += '\n';
            children.forEach(child => result += child.encode(collector, prefix + indentation));
            result += prefix;
        }
        return result;
    }
}

// VisualElement

export interface VisualElementProps extends ElementWithChildrenProps<AnimationElement> {}

export abstract class VisualElement<P extends VisualElementProps = VisualElementProps> extends ElementWithChildren<AnimationElement, P> {
    public center(): Point {
        return this.boundingBox().center();
    }
}

// StructuralElement

export interface StructuralElementProps extends ElementWithChildrenProps<ElementWithChildren<any, any>> {
    children: ElementWithChildren<any, any>[];
}

export abstract class StructuralElement<P extends StructuralElementProps> extends ElementWithChildren<ElementWithChildren<any, any>, P> {
    public constructor(props: Readonly<P>) {
        super(props);

        if (props.children.length === 0) {
            throw Error(`A structural element has to have children.`);
        }
    }

    protected _boundingBox({ children }: P): Box {
        return EncompassAll(children.map(child => child.boundingBox()));
    }

    public clippingBox(): Box | undefined {
        const boxes = filterUndefined(this.props.children.map(child => child.clippingBox()));
        return boxes.length === 0 ? undefined : EncompassAll(boxes);
    }
}
