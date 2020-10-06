import { normalizeToArray } from '../../utility/functions';
import { estimateWidthOfString, multiplier, TextStyle } from '../utility/string';

import { Box } from '../utility/box';
import { Collector } from '../utility/collector';
import { getTextHeight, indentation, lineHeight, textHeight, textMargin } from '../utility/constants';
import { round3 } from '../utility/math';
import { Point } from '../utility/point';

import { VisualElement, VisualElementProps } from './element';

/* ------------------------------ Tspan ------------------------------ */

export class Tspan {
    public constructor(
        private readonly text: TextLine,
        private readonly className: string,
        private readonly widthStyle: TextStyle,
    ) {}

    public encode(collector: Collector): string {
        collector.classes.add(this.className);
        return `<tspan class="${this.className}">${encode(this.text, collector)}</tspan>`;
    }

    public estimateWidth(): number {
        // The estimate can get even more inaccurate when the same style is nested.
        return estimateWidthOfTextLine(this.text) * multiplier(this.widthStyle);
    }
}

export function bold(text: TextLine): Tspan {
    return new Tspan(text, 'font-weight-bold', 'bold');
}

export function italic(text: TextLine): Tspan {
    return new Tspan(text, 'font-italic', 'italic');
}

export function underline(text: TextLine): Tspan {
    return new Tspan(text, 'text-underline', 'normal');
}

export function lineThrough(text: TextLine): Tspan {
    return new Tspan(text, 'text-line-through', 'normal');
}

export function preserveWhitespace(text: TextLine): Tspan {
    return new Tspan(text, 'preserve-whitespace', 'normal');
}

export function small(text: TextLine): Tspan {
    return new Tspan(text, 'small', 'small');
}

export function large(text: TextLine): Tspan {
    return new Tspan(text, 'large', 'large');
}

// The following methods are useful to circumvent kramdown's replacement of abbreviations
// (see https://github.com/gettalong/kramdown/issues/671 for more information).
export function uppercase(text: TextLine): Tspan {
    return new Tspan(text, 'text-uppercase', 'normal');
}

export function lowercase(text: TextLine): Tspan {
    return new Tspan(text, 'text-lowercase', 'normal');
}

export function capitalize(text: TextLine): Tspan {
    return new Tspan(text, 'text-capitalize', 'normal');
}

export class Anchor {
    public constructor(private readonly text: TextLine, private readonly url: string) {}

    public encode(collector: Collector): string {
        collector.elements.add('a');
        return `<a href="${this.url}">${encode(this.text, collector)}</a>`;
    }

    public estimateWidth(): number {
        return estimateWidthOfTextLine(this.text);
    }
}

// Links are not correctly styled on Safari and iOS.
export function href(text: TextLine, url: string): Anchor {
    return new Anchor(text, url);
}

/**
 * Combines several text fragments in one line.
 */
export class CombinedText {
    public constructor(private readonly texts: TextLine[]) {}

    public encode(collector: Collector): string {
        return this.texts.map(text => encode(text, collector)).join('');
    }

    public estimateWidth(): number {
        return this.texts.map(text => estimateWidthOfTextLine(text)).reduce((a, b) => a + b, 0);
    }
}

export function T(...texts: TextLine[]): CombinedText {
    return new CombinedText(texts);
}

export type TextLine = string | Tspan | Anchor | CombinedText;

function escapeStringForSVG(text: string): string {
    return text.replace('<', '&lt;').replace('>', '&gt;');
}

function encode(line: TextLine, collector: Collector): string {
    return typeof line === 'string' ? escapeStringForSVG(line) : line.encode(collector);
}

export function estimateWidthOfTextLine(line: TextLine): number {
    return typeof line === 'string' ? estimateWidthOfString(line) : line.estimateWidth();
}

/* ------------------------------ Size ------------------------------ */

export function estimateWidth(text: TextLine | TextLine[]): number {
    return normalizeToArray(text).map(text => estimateWidthOfTextLine(text)).reduce((a, b) => Math.max(a, b), 0);
}

export function calculateHeight(text: TextLine | TextLine[]): number {
    return getTextHeight(Array.isArray(text) ? text.length : 1);
}

export function estimateSize(text: TextLine | TextLine[]): Point {
    return new Point(estimateWidth(text), calculateHeight(text));
}

export function estimateSizeWithMargin(text: TextLine | TextLine[], margin: Point = textMargin): Point {
    return estimateSize(text).add(margin.multiply(2));
}

/* ------------------------------ Alignment ------------------------------ */

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

export function horizontalAlignmentFactor(value: HorizontalAlignment): number {
    switch (value) {
        case 'left': return 0;
        case 'center': return 0.5;
        case 'right': return 1;
    }
}

export function verticalAlignmentFactor(value: VerticalAlignment): number {
    switch (value) {
        case 'top': return 0;
        case 'center': return 0.5;
        case 'bottom': return 1;
    }
}

/* ------------------------------ Element ------------------------------ */

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

    protected _boundingBox({
        position,
        text,
        horizontalAlignment = 'left',
        verticalAlignment = 'top',
    }: TextProps): Box {
        const size = estimateSize(text);
        const topLeft = new Point(
            position.x - horizontalAlignmentFactor(horizontalAlignment) * size.x,
            position.y - verticalAlignmentFactor(verticalAlignment) * size.y,
        );
        return new Box(topLeft, topLeft.add(size).addY(2)); // Add 2 at the bottom for the height of descenders.
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
        // Vertical positioning is done manually because
        // Safari does not support 'dominant-baseline' on tspans
        // and Firefox displays 'hanging' on 'text' too low.
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
