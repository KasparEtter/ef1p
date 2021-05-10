/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../utility/color';
import { normalizeToArray } from '../../utility/functions';
import { estimateStringWidth, monospaceWidth, multiplier, TextStyle } from '../utility/string';

import { Box } from '../utility/box';
import { Collector } from '../utility/collector';
import { getTextHeight, indentation, lineHeight, textHeight, textMargin } from '../utility/constants';
import { round3 } from '../utility/math';
import { Point } from '../utility/point';

import { VisualElement, VisualElementProps } from './element';

/* ------------------------------ Tspan ------------------------------ */

export abstract class Tspan {
    public constructor(
        protected readonly text: TextLine,
        protected readonly className: string,
        protected readonly dy?: number,
    ) {}

    public encode(collector: Collector): string {
        collector.classes.add(this.className);
        return `<tspan class="${this.className}"${ this.dy ? ` dy="${this.dy}"` : ''}>${encode(this.text, collector)}</tspan>${ this.dy ? `<tspan dy="${this.dy * -1}">&#8203;</tspan>` : ''}`;
    }

    public abstract estimateWidth(): number;
}

function transformText(text: TextLine, className: string): TextLine {
    if (typeof text === 'string') {
        switch (className) {
            case 'text-uppercase':
                return text.toUpperCase();
            case 'text-uppercase':
                return text.toLowerCase();
            default:
                return text;
        }
    } else {
        return text;
    }
}

class TspanWithTextStyle extends Tspan {
    public constructor(
        text: TextLine,
        className: string,
        protected readonly widthStyle: TextStyle,
        protected readonly dy?: number,
    ) {
        super(text, className, dy);
    }

    public estimateWidth(): number {
        // The estimate can get even more inaccurate when the same style is nested.
        return estimateTextLineWidth(transformText(this.text, this.className)) * multiplier(this.widthStyle);
    }
}

export function colorize(color: Color, text: TextLine): Tspan {
    return new TspanWithTextStyle(text, color, 'normal');
}

export function bold(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'font-weight-bold', 'bold');
}

export function italic(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'font-italic', 'italic');
}

export function underline(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'text-underline', 'normal');
}

export function lineThrough(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'text-line-through', 'normal');
}

export function preserveWhitespace(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'preserve-whitespace', 'normal');
}

export function small(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'small', 'small');
}

export function large(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'large', 'large');
}

export function subscript(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'script', 'script', 3);
}

export function superscript(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'script', 'script', -6);
}

// The following methods are useful to circumvent kramdown's replacement of abbreviations
// (see https://github.com/gettalong/kramdown/issues/671 for more information).
export function uppercase(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'text-uppercase', 'normal');
}

export function lowercase(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'text-lowercase', 'normal');
}

export function capitalize(text: TextLine): Tspan {
    return new TspanWithTextStyle(text, 'text-capitalize', 'normal');
}

class TspanForMonospace extends Tspan {
    public constructor(
        text: string,
    ) {
        super(text, 'code');
    }

    public estimateWidth(): number {
        return (this.text as string).length * monospaceWidth;
    }
}

export function code(text: string): Tspan {
    return new TspanForMonospace(text);
}

export class Anchor {
    public constructor(private readonly text: TextLine, private readonly url: string) {}

    public encode(collector: Collector): string {
        collector.elements.add('a');
        return `<a href="${this.url}">${encode(this.text, collector)}</a>`;
    }

    public estimateWidth(): number {
        return estimateTextLineWidth(this.text);
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
        return this.texts.map(text => estimateTextLineWidth(text)).reduce((a, b) => a + b, 0);
    }
}

export function T(...texts: TextLine[]): CombinedText {
    return new CombinedText(texts);
}

export type TextLine = string | Tspan | Anchor | CombinedText;

function escapeStringForSVG(text: string): string {
    return text.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
}

function encode(line: TextLine, collector: Collector): string {
    return typeof line === 'string' ? escapeStringForSVG(line) : line.encode(collector);
}

export function estimateTextLineWidth(line: TextLine): number {
    return typeof line === 'string' ? estimateStringWidth(line) : line.estimateWidth();
}

/* ------------------------------ Size ------------------------------ */

export function estimateTextWidth(text: TextLine | TextLine[]): number {
    return normalizeToArray(text).map(text => estimateTextLineWidth(text)).reduce((a, b) => Math.max(a, b), 0);
}

export function estimateTextWidthWithMargin(text: TextLine | TextLine[], factor = 2, margin = textMargin.x): number {
    return estimateTextWidth(text) + factor * margin;
}

export function calculateTextHeight(text: TextLine | TextLine[]): number {
    return getTextHeight(Array.isArray(text) ? text.length : 1);
}

export function calculateTextHeightWithMargin(text: TextLine | TextLine[], factor = 2, margin = textMargin.y): number {
    return calculateTextHeight(text) + factor * margin;
}

export function estimateTextSize(text: TextLine | TextLine[]): Point {
    return new Point(estimateTextWidth(text), calculateTextHeight(text));
}

export function estimateTextSizeWithMargin(text: TextLine | TextLine[], factor = 2, margin: Point = textMargin): Point {
    return estimateTextSize(text).add(margin.multiply(factor));
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

    /**
     * Defaults to 'left'.
     */
    horizontalAlignment?: HorizontalAlignment;

    /**
     * Defaults to 'top'.
     */
    verticalAlignment?: VerticalAlignment;
}

export class Text extends VisualElement<TextProps> {
    public constructor(props: Readonly<TextProps>) {
        super(props);

        if (Array.isArray(props.text) && props.text.length === 0) {
            throw Error('If the text is provided as an array, at least one line has to be provided.');
        }
    }

    protected _boundingBox({
        position,
        text,
        horizontalAlignment = 'left',
        verticalAlignment = 'top',
    }: TextProps): Box {
        const size = estimateTextSize(text);
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
        let result = prefix + `<text${this.attributes(collector)} text-anchor="${translateHorizontalAlignment(horizontalAlignment)}">\n`;
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
        result += prefix + indentation;
        for (const line of text) {
            // Newlines between tspans is rendered as a space and thus needs to be avoided.
            result += `<tspan x="${position.x}" y="${round3(y)}">${encode(line, collector)}</tspan>`;
            y += lineHeight;
        }
        result += (this.children(collector, prefix) || `\n` + prefix) + `</text>\n`;
        return result;
    }

    public move(vector: Point): Text {
        return new Text({ ...this.props, position: this.props.position.add(vector) });
    }
}
