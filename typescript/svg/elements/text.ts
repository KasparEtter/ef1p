import { normalizeToArray } from '../../utility/functions';

import { Box } from '../utility/box';
import { doubleTextMargin } from '../utility/constants';
import { Point } from '../utility/point';

import { indentation, VisualElement, VisualElementProps } from './element';

// If you use any of the following functions, which return a tspan, pass the result as an array to the text element
// in order to trigger the Safari-compatible rendering by nesting it inside another, explicitly positioned tspan.

export function bold(text: string) {
    return `<tspan class="font-weight-bold">${text}</tspan>`;
}

export function italic(text: string) {
    return `<tspan class="font-italic">${text}</tspan>`;
}

export function underline(text: string) {
    return `<tspan class="text-underline">${text}</tspan>`;
}

export function lineThrough(text: string) {
    return `<tspan class="text-line-through">${text}</tspan>`;
}

export function small(text: string) {
    return `<tspan class="small">${text}</tspan>`;
}

// Links are not correctly styled on Safari and iOS.
export function href(text: string, url: string) {
    return `<a href="${url}">${text}</a>`;
}

export type TextStyle = 'bold' | 'italic' | 'small'; // For now only those that affect the width.

export function determineMultiplier(style?: TextStyle): number {
    switch (style) {
        case 'bold': return 1.024;
        case 'italic': return 0.933;
        case 'small': return 0.8;
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
    text: string | string[];
    horizontalAlignment?: HorizontalAlignment;
    verticalAlignment?: VerticalAlignment;
}

export class Text extends VisualElement<TextProps> {
    public constructor(
        props: Readonly<TextProps>,
    ) {
        super(props);

        if (Array.isArray(props.text) && props.text.length === 0) {
            throw Error(`If the text is provided as an array, at least one line has to be provided.`);
        }
    }

    protected _boundingBox({ position }: TextProps): Box {
        return new Box(position, position);
    }

    protected _encode(prefix: string, {
        position,
        text,
        horizontalAlignment = 'left',
        verticalAlignment = 'top',
    }: TextProps): string {
        text = normalizeToArray(text);
        position = position.round3();
        let result = prefix + `<text` + this.attributes()
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
        for (const line of text) {
            result += prefix + indentation + `<tspan x="${position.x}" y="${y}">${line}</tspan>\n`;
            y += lineHeight;
        }
        result += prefix + this.children(prefix) + `</text>\n`;
        return result;
    }
}
