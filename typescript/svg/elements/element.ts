import { Box } from '../utility/box';
import { Point } from '../utility/point';

export const indentation = '    ';

// Element

export abstract class Element<P = object> {
    public constructor(
        public readonly props: Readonly<P>,
    ) {}

    protected abstract _encode(prefix: string, props: Readonly<P>): string;

    public encode(prefix: string): string {
        return this._encode(prefix, this.props);
    }

    public toString(): string {
        return this.encode('');
    }
}

// AnimationElement

export abstract class AnimationElement<P = {}> extends Element<P> {}

// ElementWithChildren

export const colors = [undefined, 'blue', 'green', 'red', 'orange', 'grey'] as const;
export type Color = typeof colors[number];

export function colorSuffix(color?: Color) {
    return color ? '-' + color : '';
}

export interface ElementWithChildrenProps<C extends Element> {
    id?: string;
    color?: Color;
    style?: string;
    classes?: string[];
    transform?: string;
    children?: C[];
}

export abstract class ElementWithChildren<C extends Element, P extends ElementWithChildrenProps<C>> extends Element<P> {
    protected abstract _boundingBox(props: Readonly<P>): Box;

    public boundingBox(): Box {
        return this._boundingBox(this.props);
    }

    protected attributes(): string {
        const props = this.props;
        const classes: string[] = props.classes ?? [];
        const color: Color | undefined = props.color;
        if (color) {
            classes.unshift(color);
        }
        return (props.id ? ` id="${props.id}"` : '')
            + (props.style ? ` style="${props.style}"` : '')
            + (classes.length > 0 ? ` class="${classes.join(' ')}"` : '')
            + (props.transform ? ` transform="${props.transform}"` : '');
    }

    protected children(prefix: string): string {
        const children = this.props.children;
        let result = '';
        if (children) {
            result += '\n';
            children.forEach(child => result += child.encode(prefix + indentation));
            result += prefix;
        }
        return result;
    }
}

// VisualElement

export interface VisualElementProps extends ElementWithChildrenProps<AnimationElement> {}

export abstract class VisualElement<P extends VisualElementProps = {}> extends ElementWithChildren<AnimationElement, P> {
    public center(): Point {
        return this.boundingBox().center();
    }
}

// StructuralElement

export interface StructuralElementProps extends ElementWithChildrenProps<ElementWithChildren<any, any>> {
    children: ElementWithChildren<any, any>[];
}

export abstract class StructuralElement<P extends StructuralElementProps> extends ElementWithChildren<ElementWithChildren<any, any>, P> {
    public constructor(
        props: Readonly<P>,
    ) {
        super(props);

        if (props.children.length === 0) {
            throw Error(`A structural element has to have children.`);
        }
    }

    protected _boundingBox({ children }: P): Box {
        let boundingBox = children[0].boundingBox();
        for (let i = 1; i < children.length; i++) {
            boundingBox = children[i].boundingBox().encompass(boundingBox);
        }
        return boundingBox;
    }
}
