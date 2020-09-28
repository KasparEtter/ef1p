import { normalizeToArray } from '../../utility/functions';

import { Box } from '../utility/box';
import { Collector } from '../utility/collector';
import { doubleTextMargin, indentation } from '../utility/constants';
import { round3 } from '../utility/math';
import { Point } from '../utility/point';

import { VisualElement, VisualElementProps } from './element';

export class Tspan {
    public constructor(private readonly text: TextLine, private readonly className: string) {}

    public encode(collector: Collector): string {
        collector.classes.add(this.className);
        return `<tspan class="${this.className}">${encode(this.text, collector)}</tspan>`;
    }
}

export function bold(text: TextLine): Tspan {
    return new Tspan(text, 'font-weight-bold');
}

export function italic(text: TextLine): Tspan {
    return new Tspan(text, 'font-italic');
}

export function underline(text: TextLine): Tspan {
    return new Tspan(text, 'text-underline');
}

export function lineThrough(text: TextLine): Tspan {
    return new Tspan(text, 'text-line-through');
}

export function small(text: TextLine): Tspan {
    return new Tspan(text, 'small');
}

export function large(text: TextLine): Tspan {
    return new Tspan(text, 'large');
}

// The following methods are useful to circumvent kramdown's replacement of abbreviations
// (see https://github.com/gettalong/kramdown/issues/671 for more information).
export function uppercase(text: TextLine): Tspan {
    return new Tspan(text, 'text-uppercase');
}

export function lowercase(text: TextLine): Tspan {
    return new Tspan(text, 'text-lowercase');
}

export function capitalize(text: TextLine): Tspan {
    return new Tspan(text, 'text-capitalize');
}

export class Anchor {
    public constructor(private readonly text: TextLine, private readonly url: string) {}

    public encode(collector: Collector): string {
        collector.elements.add('a');
        return `<a href="${this.url}">${encode(this.text, collector)}</a>`;
    }
}

// Links are not correctly styled on Safari and iOS.
export function href(text: TextLine, url: string): Anchor {
    return new Anchor(text, url);
}

export class CombinedText {
    public constructor(private readonly texts: TextLine[]) {}

    public encode(collector: Collector): string {
        return this.texts.map(text => encode(text, collector)).join('');
    }
}

export function T(...texts: TextLine[]): CombinedText {
    return new CombinedText(texts);
}

export type TextLine = string | Tspan | Anchor | CombinedText;

function encode(line: TextLine, collector: Collector): string {
    return typeof line === 'string' ? line : line.encode(collector);
}

export type TextStyle = 'bold' | 'italic' | 'small' | 'large'; // For now only those that affect the width.

export function determineMultiplier(style?: TextStyle): number {
    switch (style) {
        case 'bold': return 1.024;
        case 'italic': return 0.933;
        case 'small': return 0.8;
        case 'large': return 2;
        default: return 1;
    }
}

export function estimateWidth(text: string | string[], style?: TextStyle): number {
    if (Array.isArray(text) && text.length === 0) {
        throw Error(`If the text is provided as an array, at least one item has to be provided.`);
    }

    const length = Array.isArray(text) ? Math.max(...(text.map(item => item.length))) : text.length;
    return length * 6.85 * determineMultiplier(style);
}

export const textHeight = 11.5;
export const lineHeight = 22;

export function determineHeight(text: string | string[]): number {
    return textHeight + (Array.isArray(text) ? text.length - 1 : 0) * lineHeight;
}

export function estimateSize(text: string | string[], style?: TextStyle): Point {
    return new Point(estimateWidth(text, style), determineHeight(text)).add(doubleTextMargin);
}

export type HorizontalAlignment = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'center' | 'bottom';
export interface Alignment {
    horizontalAlignment: HorizontalAlignment;
    verticalAlignment: VerticalAlignment;
}

export function translateHorizontalAlignment(value: HorizontalAlignment): string {
    switch (value) {
        case 'left': return 'start';
        case 'center': return 'middle';
        case 'right': return 'end';
    }
}

export function translateVerticalAlignment(value: VerticalAlignment): string {
    switch (value) {
        case 'top': return 'hanging';
        case 'center': return 'central';
        case 'bottom': return 'baseline';
    }
}

export interface TextProps extends VisualElementProps {
    position: Point;
    text: TextLine | TextLine[];
    horizontalAlignment?: HorizontalAlignment;
    verticalAlignment?: VerticalAlignment;
}

export class Text extends VisualElement<TextProps> {
    public constructor(props: Readonly<TextProps>) {
        super(props);

        if (Array.isArray(props.text) && props.text.length === 0) {
            throw Error(`If the text is provided as an array, at least one line has to be provided.`);
        }
    }

    protected _boundingBox({ position }: TextProps): Box {
        return new Box(position, position);
    }

    protected _encode(collector: Collector, prefix: string, {
        position,
        text,
        horizontalAlignment = 'left',
        verticalAlignment = 'top',
    }: TextProps): string {
        text = normalizeToArray(text);
        position = position.round3();
        collector.elements.add('text');
        let result = prefix + `<text` + this.attributes(collector)
            + ` x="${position.x}"`
            + ` y="${position.y}"`
            + ` text-anchor="${translateHorizontalAlignment(horizontalAlignment)}">\n`;
        let y: number;
        // Vertical positioning is done manually because Safari does not support 'dominant-baseline' on tspans and Firefox displays 'hanging' on 'text' too low.
        switch (verticalAlignment) {
            case 'top':
                y = position.y + textHeight;
                break;
            case 'center':
                y = position.y - (text.length - 1) * lineHeight / 2 + 5.9;
                break;
            case 'bottom':
                y = position.y - (text.length - 1) * lineHeight;
                break;
        }
        collector.elements.add('tspan');
        for (const line of text) {
            result += prefix + indentation + `<tspan x="${position.x}" y="${round3(y)}">${encode(line, collector)}</tspan>\n`;
            y += lineHeight;
        }
        result += prefix + this.children(collector, prefix) + `</text>\n`;
        return result;
    }
}
