import { VisualElement, VisualElementProps } from './element';
import { Text, TextLine, TextProps } from './text';

export abstract class CenterTextElement<P extends VisualElementProps> extends VisualElement<P> {
    public text(
        text: TextLine | TextLine[],
        props: Omit<TextProps, 'position' | 'text' | 'horizontalAlignment' | 'verticalAlignment'> = {},
    ): Text {
        const position = this.center();
        const horizontalAlignment = 'center';
        const verticalAlignment = 'center';
        const color = this.props.color;
        const ignoreForClipping = true;
        return new Text({ position, text, horizontalAlignment, verticalAlignment, color, ignoreForClipping, ...props });
    }
}
