/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Point, zeroPoint } from '../utility/point';

import { VisualElement, VisualElementProps } from './element';
import { Text, TextLine, TextProps } from './text';

export abstract class CenterTextElement<P extends VisualElementProps> extends VisualElement<P> {
    public text(
        text: TextLine | TextLine[],
        props: Omit<TextProps, 'position' | 'text'> = {},
        offset: Point = zeroPoint,
    ): Text {
        const position = this.center().add(offset);
        const horizontalAlignment = 'center';
        const verticalAlignment = 'center';
        const color = this.props.color;
        const ignoreForClipping = true;
        return new Text({ position, text, horizontalAlignment, verticalAlignment, color, ignoreForClipping, ...props });
    }

    public withText(
        text: TextLine | TextLine[],
        props: Omit<TextProps, 'position' | 'text'> = {},
        offset: Point = zeroPoint,
    ): [this, Text] {
        return [this, this.text(text, props, offset)];
    }
}
