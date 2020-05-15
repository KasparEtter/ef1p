import path from 'path';

// Point

export type LineSide = 'left' | 'right';

export class Point {
    public constructor(
        public readonly x: number,
        public readonly y: number,
    ) {}

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(length: number): Point {
        return this.divide(this.length()).multiply(length);
    }

    public round(): Point {
        return new Point(Math.round(this.x), Math.round(this.y));
    }

    public round3(): Point {
        return new Point(Math.round(this.x * 1000) / 1000, Math.round(this.y * 1000) / 1000);
    }

    public absolute(): Point {
        return new Point(Math.abs(this.x), Math.abs(this.y));
    }

    public sign(): Point {
        return new Point(Math.sign(this.x), Math.sign(this.y));
    }

    public invert(): Point {
        return new Point(-this.x, -this.y);
    }

    public add(that: Point): Point {
        return new Point(this.x + that.x, this.y + that.y);
    }

    public addX(value: number): Point {
        return new Point(this.x + value, this.y);
    }

    public addY(value: number): Point {
        return new Point(this.x, this.y + value);
    }

    public subtract(that: Point): Point {
        return new Point(this.x - that.x, this.y - that.y);
    }

    public subtractX(value: number): Point {
        return new Point(this.x - value, this.y);
    }

    public subtractY(value: number): Point {
        return new Point(this.x, this.y - value);
    }

    public multiply(factor: number): Point {
        return new Point(this.x * factor, this.y * factor);
    }

    public divide(factor: number): Point {
        return new Point(this.x / factor, this.y / factor);
    }

    public min(that: Point): Point {
        return new Point(Math.min(this.x, that.x), Math.min(this.y, that.y));
    }

    public max(that: Point): Point {
        return new Point(Math.max(this.x, that.x), Math.max(this.y, that.y));
    }

    public boundingBox(that: Point): Box {
        return new Box(this.min(that), this.max(that));
    }

    public center(that: Point): Point {
        return new Point((this.x + that.x) / 2, (this.y + that.y) / 2);
    }

    public distanceTo(that: Point): number {
        return that.subtract(this).length();
    }

    /**
     * Creates the given number of evenly spaced points from this point to that point (including both).
     */
    public space(that: Point, amount: number): Point[] {
        if (amount < 2) {
            throw Error(`The number of points has to be at least two but was ${amount}.`);
        }
        const step = that.subtract(this).divide(amount - 1);
        const points: Point[] = new Array(amount);
        for (let i = 0; i < amount; i++) {
            points[i] = this.add(step.multiply(i));
        }
        return points;
    }

    /**
     * Rotates this vector by 90 degrees.
     */
    public rotate(side: LineSide): Point {
        const factor = side === 'right' ? 1 : -1; // The y-axis points downwards.
        return new Point(-this.y * factor, this.x * factor);
    }

    public encode(): string {
        return `${this.x},${this.y}`;
    }

    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}

export function P(x: number, y: number): Point {
    return new Point(x, y);
}

// Box

export type BoxSide = 'top' | 'right' | 'bottom' | 'left';

export function opposite(a: BoxSide, b: BoxSide): boolean {
    return a === 'top' && b === 'bottom'
        || a === 'right' && b === 'left'
        || a === 'bottom' && b === 'top'
        || a === 'left' && b === 'right';
}

export class Box {
    public constructor(
        public readonly topLeft: Point,
        public readonly bottomRight: Point,
    ) {
        if (topLeft.x > bottomRight.x || topLeft.y > bottomRight.y) {
            throw Error(`The top left point ${topLeft.toString()} has to be to the top and the left of the bottom right point ${bottomRight.toString()}.`);
        }
    }

    public size(): Point {
        return this.bottomRight.subtract(this.topLeft);
    }

    public center(): Point {
        return this.topLeft.center(this.bottomRight);
    }

    public encompass(that: Box): Box {
        return new Box(this.topLeft.min(that.topLeft), this.bottomRight.max(that.bottomRight));
    }

    public addMargin(that: Point): Box {
        return new Box(this.topLeft.subtract(that), this.bottomRight.add(that));
    }

    public point(side: BoxSide): Point {
        const center = this.topLeft.center(this.bottomRight);
        switch (side) {
            case 'top':
                return new Point(center.x, this.topLeft.y);
            case 'right':
                return new Point(this.bottomRight.x, center.y);
            case 'bottom':
                return new Point(center.x, this.bottomRight.y);
            case 'left':
                return new Point(this.topLeft.x, center.y);
        }
    }

    public toString(): string {
        return `[${this.topLeft.toString()}, ${this.bottomRight.toString()}]`;
    }
}

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

// Most important colors: info (blue), success (green), and danger (red).
export type Color = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark';

// This list of colors is needed to generate an end-o
export const colors: (Color | undefined)[] = [undefined, 'primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'];

export function suffix(color?: Color) {
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
    public middle(): Point {
        return this.boundingBox().center();
    }

    public lineTo(
        that: VisualElement,
        thisSide: BoxSide = 'right',
        thatSide: BoxSide = 'left',
        props: Omit<LineProps, 'start' | 'end'> = {},
    ): Line {
        const start = this.boundingBox().point(thisSide);
        const end = that.boundingBox().point(thatSide);
        const marker = 'end';
        return new Line({ start, end, marker, ...props });
    }

    public arcTo(
        that: VisualElement,
        startSide: BoxSide,
        endSide: BoxSide,
        props: Omit<ArcProps, 'start' | 'startSide' | 'end' | 'endSide'> = {},
    ): Arc {
        const start = this.boundingBox().point(startSide);
        const end = that.boundingBox().point(endSide);
        const marker = 'end';
        return new Arc({ start, startSide, end, endSide, marker, ...props });
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

// Group

export const indentation = '    ';

export class Group extends StructuralElement<StructuralElementProps> {
    protected _encode(prefix: string): string {
        return prefix + `<g${this.attributes()}>${this.children(prefix)}</g>\n`;
    }
}

// SVG

export const strokeMargin = new Point(1.5, 1.5);

interface SVGProps extends StructuralElementProps {
    title?: string;
    description?: string;
    embedded?: boolean;
}

export class SVG extends StructuralElement<SVGProps> {
    protected _encode(prefix: string, {
        title,
        description,
        embedded = process.argv[2] === 'embedded',
    }: SVGProps): string {
        const name = path.basename(process.argv[1], '.ts');
        const box = this.boundingBox().addMargin(strokeMargin);
        const size = box.size();

        let result = prefix + `<svg`
            + (embedded ? ` id="figure-${name}"` : '')
            + (embedded ? ` class="figure"` : '')
            + (embedded ? ` data-name="${name}"` : '')
            + ` width="${size.x}"`
            + ` height="${size.y}"`
            + ` viewBox="${box.topLeft.x} ${box.topLeft.y} ${size.x} ${size.y}"`
            + ` preserveAspectRatio="xMidYMid"`
            + ` xmlns="http://www.w3.org/2000/svg">\n`;

        if (title) {
            result += prefix + indentation + `<title>${title}</title>\n`;
        }
        if (description) {
            result += prefix + indentation + `<desc>${description}</desc>\n`;
        }
        result += '\n';

        if (!embedded) {
            result += prefix + indentation + `<metadata>\n`;
            result += prefix + indentation + indentation + `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:schema="http://schema.org/">\n`;
            result += prefix + indentation + indentation + indentation + `<rdf:Description rdf:about="">\n`;
            result += prefix + indentation + indentation + indentation + indentation + `<schema:author rdf:resource="https://www.kasparetter.com/"/>\n`;
            result += prefix + indentation + indentation + indentation + indentation + `<schema:license rdf:resource="https://creativecommons.org/licenses/by/4.0/"/>\n`;
            result += prefix + indentation + indentation + indentation + indentation + `<schema:dateModified>${new Date().toISOString().slice(0, 16) + 'Z'}</schema:dateModified>\n`;
            result += prefix + indentation + indentation + indentation + `</rdf:Description>\n`;
            result += prefix + indentation + indentation + `</rdf:RDF>\n`;
            result += prefix + indentation + `</metadata>\n\n`;
            result += prefix + indentation + style;
        }

        result += prefix + indentation + `<defs>\n`;
        for (const color of colors) {
            result += prefix + indentation + indentation + `<marker id="arrow${suffix(color)}" orient="auto-start-reverse" markerWidth="4" markerHeight="4" refX="4" refY="2">\n`;
            result += prefix + indentation + indentation + indentation + `<path d="M0,0 L1,2 L0,4 L4,2 Z"${color ? ' class="' + color + '"' : ''} />\n`;
            result += prefix + indentation + indentation + `</marker>\n`;
        }
        for (const color of colors) {
            result += prefix + indentation + indentation + `<marker id="circle${suffix(color)}" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5">\n`;
            result += prefix + indentation + indentation + indentation + `<circle cx="1.5" cy="1.5" r="1"${color ? ' class="' + color + '"' : ''} />\n`;
            result += prefix + indentation + indentation + `</marker>\n`;
        }
        result += prefix + indentation + `</defs>\n`;

        result += this.children(prefix) + `</svg>\n`;
        return result;
    }

    public print() {
        // tslint:disable-next-line: no-console
        console.log(this.toString());
    }
}

// Text

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
        if (!Array.isArray(text)) {
            text = [text];
        }
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

// Invisible point to include in the overall bounding box

export interface InvisiblePointProps extends VisualElementProps {
    point: Point;
}

export class InvisiblePoint extends VisualElement<InvisiblePointProps> {
    protected _boundingBox({ point }: InvisiblePointProps): Box {
        return new Box(point, point);
    }

    protected _encode(): string {
        return '';
    }
}

// Line

export type Marker = 'start' | 'mid' | 'end';
export const lineToTextDistance = 14;

export function markerAttributes(length: () => number, marker?: Marker | Marker[], color?: Color, midMarker: boolean = false): string {
    let result = '';
    if (marker !== undefined) {
        if (!Array.isArray(marker)) {
            marker = [ marker ];
        }
        const arrow = `"url(#arrow${suffix(color)})"`;
        const circle = `"url(#circle${suffix(color)})"`;
        let arrowCounter = 0;

        if (marker.includes('start')) {
            result += ' marker-start=' + arrow;
            arrowCounter++;
        } else if (marker.includes('mid')) {
            result += ' marker-start=' + circle;
        }

        if (midMarker && marker.includes('mid')) {
            result += ' marker-mid=' + circle;
        }

        if (marker.includes('end')) {
            result += ' marker-end=' + arrow;
            arrowCounter++;
        } else if (marker.includes('mid')) {
            result += ' marker-end=' + circle;
        }

        if (arrowCounter > 0) {
            const pixels = 7; // Should be between 4 and 10. (For a stroke width of 4, 10 was a good value.)
            const reducedLength = Math.round(length()) - arrowCounter * pixels;
            result += ` stroke-dasharray="${reducedLength}"`;
            if (marker.includes('start')) {
                result += ` stroke-dashoffset="${2 * reducedLength - pixels}"`; // Safari doesn't support negative dash offsets.
            }
        }
    }
    return result;
}

export function determineAlignment(offset: Point): Alignment {
    const absoluteOffset = offset.absolute();
    let horizontalAlignment: HorizontalAlignment;
    if (absoluteOffset.y > absoluteOffset.x * 4) {
        horizontalAlignment = 'center';
    } else if (offset.x > 0) {
        horizontalAlignment = 'left';
    } else {
        horizontalAlignment = 'right';
    }
    let verticalAlignment: VerticalAlignment;
    if (absoluteOffset.x > absoluteOffset.y * 4) {
        verticalAlignment = 'center';
    } else if (offset.y > 0) {
        verticalAlignment = 'top';
    } else {
        verticalAlignment = 'bottom';
    }
    return { horizontalAlignment, verticalAlignment };
}

export interface LineProps extends VisualElementProps {
    start: Point;
    end: Point;
    marker?: Marker | Marker[];
}

export class Line extends VisualElement<LineProps> {
    public vector(): Point {
        return this.props.end.subtract(this.props.start);
    }

    public length(): number {
        return this.vector().length();
    }

    protected _boundingBox({ start, end }: LineProps): Box {
        return start.boundingBox(end);
    }

    protected _encode(prefix: string, {
        start,
        end,
        marker,
        color,
    }: LineProps): string {
        start = start.round3();
        end = end.round3();
        return prefix + `<line${this.attributes()}`
            + ` x1="${start.x}"`
            + ` y1="${start.y}"`
            + ` x2="${end.x}"`
            + ` y2="${end.y}"`
            + markerAttributes(this.length.bind(this), marker, color)
            + `>${this.children(prefix)}</line>\n`;
    }

    public text(
        text: string | string[],
        side: LineSide = 'left',
        // Horizontal and vertical alignment are intentionally not excluded because the defaults should be overridable.
        props: Omit<TextProps, 'position' | 'text'> = {},
    ): Text {
        const offset = this.vector().rotate(side).normalize(lineToTextDistance);
        const position = this.middle().add(offset);
        const color = this.props.color;
        return new Text({ position, text, ...determineAlignment(offset), color, ...props });
    }

    public shorten(startOffset: number, endOffset: number = startOffset): Line {
        const vector = this.vector();
        const start = this.props.start.add(vector.normalize(startOffset));
        const end = this.props.end.subtract(vector.normalize(endOffset));
        return new Line({ ...this.props, start, end }); // Overriding old start and end properties.
    }
}

// Rectangle

export const cornerRadiusDefault = 8;
export const textMargin = new Point(12, 14);
export const doubleTextMargin = textMargin.multiply(2);

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

// CenterTextElement

export abstract class CenterTextElement<P extends VisualElementProps> extends VisualElement<P> {
    public text(
        text: string | string[],
        props: Omit<TextProps, 'position' | 'text' | 'horizontalAlignment' | 'verticalAlignment'> = {},
    ): Text {
        const position = this.middle();
        const horizontalAlignment = 'center';
        const verticalAlignment = 'center';
        const color = this.props.color;
        return new Text({ position, text, horizontalAlignment, verticalAlignment, color, ...props });
    }
}

// Circle

export interface CircleProps extends VisualElementProps {
    center: Point;
    radius: number;
}

export class Circle extends CenterTextElement<CircleProps> {
    public constructor(
        props: Readonly<CircleProps>,
    ) {
        super(props);

        if (props.radius <= 0) {
            throw Error(`The radius ${props.radius} has to be positive.`);
        }
    }

    protected _boundingBox({ center, radius }: CircleProps): Box {
        const vector = new Point(radius, radius);
        return new Box(center.subtract(vector), center.add(vector));
    }

    protected _encode(prefix: string, { center, radius }: CircleProps): string {
        center = center.round3();
        radius = Math.round(radius * 1000) / 1000;
        return prefix + `<circle${this.attributes()}`
            + ` cx="${center.x}" cy="${center.y}"`
            + ` r="${radius}">`
            + `${this.children(prefix)}</circle>\n`;
    }
}

// Ellipse

export interface EllipseProps extends VisualElementProps {
    center: Point;
    radius: Point;
}

export class Ellipse extends CenterTextElement<EllipseProps> {
    public constructor(
        props: Readonly<EllipseProps>,
    ) {
        super(props);

        if (props.radius.x <= 0 || props.radius.y <= 0) {
            throw Error(`The radius ${props.radius.toString()} has to be positive.`);
        }
    }

    protected _boundingBox({ center, radius }: EllipseProps): Box {
        return new Box(center.subtract(radius), center.add(radius));
    }

    protected _encode(prefix: string, { center, radius }: EllipseProps): string {
        center = center.round3();
        radius = radius.round3();
        return prefix + `<ellipse${this.attributes()}`
            + ` cx="${center.x}" cy="${center.y}"`
            + ` rx="${radius.x}" ry="${radius.y}">`
            + `${this.children(prefix)}</ellipse>\n`;
    }
}

// Polygon

export interface PolygonProps extends VisualElementProps {
    points: Point[];
}

export class Polygon extends CenterTextElement<PolygonProps> {
    public constructor(
        props: Readonly<PolygonProps>,
    ) {
        super(props);

        if (props.points.length < 3) {
            throw Error(`A polygon requires at least three points.`);
        }
    }

    protected _boundingBox({ points }: PolygonProps): Box {
        const min = points.reduce((previous, current) => previous.min(current), points[0]);
        const max = points.reduce((previous, current) => previous.max(current), points[0]);
        return new Box(min, max);
    }

    protected _encode(prefix: string, { points }: PolygonProps): string {
        return prefix + `<polygon${this.attributes()}`
            + ` points="${points.map(point => point.round3().encode()).join(' ')}">`
            + `${this.children(prefix)}</polygon>\n`;
    }
}

// Polyline

export interface PolylineProps extends VisualElementProps {
    points: Point[];
    marker?: Marker | Marker[];
}

export class Polyline extends VisualElement<PolylineProps> {
    public constructor(
        props: Readonly<PolylineProps>,
    ) {
        super(props);

        if (props.points.length < 3) {
            throw Error(`A polyline requires at least three points.`);
        }
    }

    public length(): number {
        let length = 0;
        const points = this.props.points;
        for (let i = 1; i < points.length; i++) {
            length += points[i - 1].distanceTo(points[i]);
        }
        return length;
    }

    protected _boundingBox({ points }: PolylineProps): Box {
        const min = points.reduce((previous, current) => previous.min(current), points[0]);
        const max = points.reduce((previous, current) => previous.max(current), points[0]);
        return new Box(min, max);
    }

    protected _encode(prefix: string, { points, marker, color }: PolylineProps): string {
        return prefix + `<polyline${this.attributes()}`
            + ` points="${points.map(point => point.round3().encode()).join(' ')}"`
            + markerAttributes(this.length.bind(this), marker, color, true)
            + `>${this.children(prefix)}</polyline>\n`;
    }
}

// Arc

export interface ArcProps extends VisualElementProps {
    start: Point;
    startSide: BoxSide;
    end: Point;
    endSide: BoxSide;
    radius?: number; // Used if startSide === endSide.
    marker?: Marker | Marker[];
}

export const defaultArcRadius = 50;

export enum Rotation {
    counterclockwise = 0,
    clockwise = 1,
}

export type ArcSide = 'inside' | 'outside';

export class Arc extends VisualElement<ArcProps> {
    public constructor(
        props: Readonly<ArcProps>,
    ) {
        super(props);

        if (opposite(props.startSide, props.endSide)) {
            throw Error(`The start and end side of an arc may not be opposites.`);
        }

        if (props.radius) {
            if (props.startSide !== props.endSide) {
                throw Error(`A radius may only be provided if both sides of the arc are the same.`);
            } else if (props.radius <= 0) {
                throw Error(`The radius of an arc has to be positive.`);
            }
        }

        if (props.startSide === props.endSide) {
            if ((props.startSide === 'top' || props.startSide === 'bottom') && props.start.y !== props.end.y) {
                throw Error(`If an arc starts and ends at the top or bottom, the Y values of the start and end have to be the same.`);
            }
            if ((props.startSide === 'right' || props.startSide === 'left') && props.start.x !== props.end.x) {
                throw Error(`If an arc starts and ends at the right or left, the X values of the start and end have to be the same.`);
            }
        }
    }

    public radius(): Point {
        const { start, end, radius = defaultArcRadius } = this.props;
        const vector = end.subtract(start).absolute();
        if (vector.x === 0) {
            return new Point(radius, vector.y / 2);
        } else if (vector.y === 0) {
            return new Point(vector.x / 2, radius);
        } else {
            return vector;
        }
    }

    public length(): number {
        const {x, y} = this.radius();
        // Approximation 3 from https://www.mathsisfun.com/geometry/ellipse-perimeter.html.
        const h = ((x - y) * (x - y)) / ((x + y) * (x + y));
        const circumference = Math.PI * (x + y) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h)));
        if (this.props.startSide === this.props.endSide) {
            return circumference / 2;
        } else {
            return circumference / 4;
        }
    }

    protected _boundingBox({ start, startSide, end, endSide, radius = defaultArcRadius }: ArcProps): Box {
        const boundingBox = start.boundingBox(end);
        if (startSide === endSide) {
            switch (startSide) {
                case 'top':
                    return new Box(boundingBox.topLeft.subtractY(radius), boundingBox.bottomRight);
                case 'right':
                    return new Box(boundingBox.topLeft, boundingBox.bottomRight.addX(radius));
                case 'bottom':
                    return new Box(boundingBox.topLeft, boundingBox.bottomRight.addY(radius));
                case 'left':
                    return new Box(boundingBox.topLeft.subtractX(radius), boundingBox.bottomRight);
            }
        } else {
            return boundingBox;
        }
    }

    protected rotation(): Rotation {
        const { start, startSide, end, endSide } = this.props;
        if (startSide === endSide) {
            const vector = end.subtract(start);
            switch (startSide) {
                case 'top':
                    return vector.x > 0 ? Rotation.clockwise : Rotation.counterclockwise;
                case 'right':
                    return vector.y > 0 ? Rotation.clockwise : Rotation.counterclockwise;
                case 'bottom':
                    return vector.x < 0 ? Rotation.clockwise : Rotation.counterclockwise;
                case 'left':
                    return vector.y < 0 ? Rotation.clockwise : Rotation.counterclockwise;
            }
        } else {
            switch (startSide) {
                case 'top':
                    return endSide === 'left' ? Rotation.clockwise : Rotation.counterclockwise;
                case 'right':
                    return endSide === 'top' ? Rotation.clockwise : Rotation.counterclockwise;
                case 'bottom':
                    return endSide === 'right' ? Rotation.clockwise : Rotation.counterclockwise;
                case 'left':
                    return endSide === 'bottom' ? Rotation.clockwise : Rotation.counterclockwise;
            }
        }
    }

    protected _encode(prefix: string, { start, end, marker, color }: ArcProps): string {
        const {x, y} = this.radius().round3(); // This rounding (and numeric imprecision) could introduce problems in case of half ellipses.
        return prefix + `<path${this.attributes()}`
            + ` d="M ${start.round3().encode()} A ${x} ${y} 0 0 ${this.rotation()} ${end.encode()}"`
            + markerAttributes(this.length.bind(this), marker, color)
            + `>${this.children(prefix)}</path>\n`;
    }

    public text(
        text: string | string[],
        side: ArcSide,
        props: Omit<TextProps, 'position' | 'text' | 'horizontalAlignment' | 'verticalAlignment'> = {},
    ): Text {
        const { start, startSide, end, endSide, radius = defaultArcRadius, color } = this.props;
        const rotation = this.rotation();

        // Determine the center of the arc and the opposite point on the bounding box.
        let center: Point;
        let opposite: Point;
        if (startSide === endSide) {
            center = start.center(end);
            switch (startSide) {
                case 'top':
                    opposite = center.subtractY(radius);
                    break;
                case 'right':
                    opposite = center.addX(radius);
                    break;
                case 'bottom':
                    opposite = center.addY(radius);
                    break;
                case 'left':
                    opposite = center.subtractX(radius);
                    break;
            }
        } else {
            // Determine the points clockwise and swap afterwards otherwise.
            const direction = end.subtract(start).sign();
            switch (direction.x * direction.y) {
                case 1:
                    center = new Point(start.x, end.y);
                    opposite = new Point(end.x, start.y);
                    break;
                case -1:
                    center = new Point(end.x, start.y);
                    opposite = new Point(start.x, end.y);
                    break;
                default:
                    throw Error(`Unless the start and the end side of the arc are the same, neither the X nor the Y values of the start and end may be the same.`);
            }
            if (rotation === Rotation.counterclockwise) {
                const temporary = center;
                center = opposite;
                opposite = temporary;
            }
        }

        // Determine the vector from the center to the intersection with the arc towards the opposite point.
        let vector = opposite.subtract(center);
        if (startSide !== endSide) {
            const angle = Math.atan(vector.y / vector.x);
            const {x, y} = vector.absolute();
            const xSin = x * Math.sin(angle);
            const yCos = y * Math.cos(angle);
            // https://math.stackexchange.com/questions/432902/how-to-get-the-radius-of-an-ellipse-at-a-specific-angle-by-knowing-its-semi-majo
            const r = x * y / Math.sqrt(xSin * xSin + yCos * yCos);
            vector = vector.normalize(r);
        }

        // Determine the position on the desired arc side.
        let offset = vector.normalize(lineToTextDistance);
        if (side === 'inside') {
            offset = offset.invert();
        }
        const position = center.add(vector).add(offset);

        return new Text({ position, text, ...determineAlignment(offset), color, ...props });
    }
}

/*

Ideas for future features:
- Add methods to help with the transform attribute:
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
- Implement a CustomElement and use that for <path> (as the bounding box is complicated to determine and needs to be provided)
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
- Implement <animate> and <set> elements to provide as children to visual elements
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/onclick
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/begin
  - https://css-tricks.com/guide-svg-animations-smil/
- Implement <symbol> and <use>:
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use
- Implement <image> if needed:
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image

Cheat sheets:
- https://learn-the-web.algonquindesign.ca/topics/svg-cheat-sheet/

*/

// Embedded CSS

export const style = `<style>
        @import url("https://fonts.googleapis.com/css?family=Lato:400,700,400italic");

        svg {
            fill: black;
            stroke: black;
            font-family: Lato,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
        }

        text {
            stroke-opacity: 0;
        }

        line, rect, circle, ellipse, polygon, polyline, path {
            fill-opacity: 0;
            stroke-width: 3px;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        marker > path {
            fill-opacity: 1;
            stroke-opacity: 0;
        }

        marker > circle {
            fill-opacity: 1;
            stroke-width: 1px;
        }

        .font-weight-bold {
            font-weight: bold;
        }

        .font-italic {
            font-style: italic;
        }

        .text-underline {
            text-decoration: underline;
        }

        .text-line-through {
            text-decoration: line-through;
        }

        .small {
            font-size: 80%;
        }

        a {
            color: #18BC9C;
            text-decoration: none;
        }

        .primary {
            fill: #2C3E50;
            stroke: #2C3E50;
        }

        .secondary {
            fill: #95a5a6;
            stroke: #95a5a6;
        }

        .success {
            fill: #18BC9C;
            stroke: #18BC9C;
        }

        .info {
            fill: #3498DB;
            stroke: #3498DB;
        }

        .warning {
            fill: #F39C12;
            stroke: #F39C12;
        }

        .danger {
            fill: #E74C3C;
            stroke: #E74C3C;
        }

        .light {
            fill: #ecf0f1;
            stroke: #ecf0f1;
        }

        .dark {
            fill: #7b8a8b;
            stroke: #7b8a8b;
        }
    </style>

`;
