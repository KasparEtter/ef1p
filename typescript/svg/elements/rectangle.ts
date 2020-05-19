import { Box } from '../utility/box';
import { Point } from '../utility/point';

import { cornerRadiusDefault, textMargin } from './constants';
import { VisualElement, VisualElementProps } from './element';
import { Text, TextProps } from './text';

export interface RectangleProps extends VisualElementProps {
    position: Point;
    size: Point;
    cornerRadius?: number;
}

export class Rectangle extends VisualElement<RectangleProps> {
    public constructor(
        props: Readonly<RectangleProps>,
    ) {
        super(props);

        if (props.size.x < 0 || props.size.y < 0) {
            throw Error(`The size ${props.size.toString()} has to be positive.`);
        }
    }

    protected _boundingBox({ position, size }: RectangleProps): Box {
        return new Box(position, position.add(size));
    }

    protected _encode(prefix: string, {
        position,
        size,
        cornerRadius = cornerRadiusDefault,
    }: RectangleProps): string {
        position = position.round3();
        size = size.round3();
        return prefix + `<rect${this.attributes()}`
            + ` x="${position.x}" y="${position.y}"`
            + ` width="${size.x}" height="${size.y}"`
            + ` rx="${cornerRadius}" ry="${cornerRadius}">`
            + `${this.children(prefix)}</rect>\n`;
    }

    public text(
        text: string | string[],
        props: Omit<TextProps, 'position' | 'text'> = {},
    ): Text {
        let x: number;
        let y: number;
        const box = this.boundingBox();
        const center = box.center();
        const horizontalAlignment = props.horizontalAlignment ?? 'center';
        const verticalAlignment = props.verticalAlignment ?? 'center';
        switch (horizontalAlignment) {
            case 'left':
                x = box.topLeft.x + textMargin.x;
                break;
            case 'center':
                x = center.x;
                break;
            case 'right':
                x = box.bottomRight.x - textMargin.x;
                break;
        }
        switch (verticalAlignment) {
            case 'top':
                y = box.topLeft.y + textMargin.y;
                break;
            case 'center':
                y = center.y;
                break;
            case 'bottom':
                y = box.bottomRight.y - textMargin.y;
                break;
        }
        const position = new Point(x, y);
        const color = this.props.color;
        return new Text({ position, text, horizontalAlignment, verticalAlignment, color, ...props });
    }
}
