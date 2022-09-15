/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { getRandomElement } from '../utility/array';
import { Color, getColorClass } from '../utility/color';
import { regex } from '../utility/string';
import { estimateStringWidth } from '../utility/string-width';

import { AdditionSign, encodeInteger, Exponent, getListSeparator, ListSeparator, MinusSign, renderInteger } from './formatting';
import { Group, GroupElement } from './group';
import { IntegerFormat, nonNegativeIntegerString, nonNegativeIntegerWithoutComma } from './integer';
import { MultiplicativeRing, MultiplicativeRingElement } from './multiplicative-ring';
import { four } from './utility';

export const curvePointRegex = regex(`( *O *|( *\\()?(${nonNegativeIntegerWithoutComma},${nonNegativeIntegerWithoutComma}|${nonNegativeIntegerString};${nonNegativeIntegerString})(\\) *)?)`);

export const maxModulusForPointCounting = BigInt(100_000);

/**
 * Elliptic curves of the form y^2 = x^3 + ax + b.
 */
export class EllipticCurve extends Group<EllipticCurve, EllipticCurveElement> {
    public constructor(
        public readonly field: MultiplicativeRing,
        public readonly a: MultiplicativeRingElement,
        public readonly b: MultiplicativeRingElement,
        order?: bigint,
    ) {
        super(order);

        if (!field.isField()) {
            throw new Error(`The ring ${field} is not a field.`);
        }

        if (!a.ring.equals(field) || !b.ring.equals(field)) {
            throw new Error(`One of the parameters does not belong to the field ${field}.`);
        }

        if (field.getElement(four).multiply(a.cube()).add(field.getElement(BigInt(27)).multiply(b.square())).isZero()) {
            throw new Error(`The parameters a = ${a} and b = ${b} do not satisfy 4a^3 + 27b^2 ≠ 0.`);
        }
    }

    // Do not change the x coordinate of the identity as this would affect Pollard's rho algorithm.
    public readonly identity = new EllipticCurveElement(this, this.field.zero, this.field.zero, true);

    public getElements(x: MultiplicativeRingElement): [EllipticCurveElement, EllipticCurveElement] | undefined {
        const y2 = x.cube().add(x.multiply(this.a)).add(this.b);
        const ys = y2.squareRoots();
        if (ys !== undefined) {
            return [new EllipticCurveElement(this, x, ys[0]), new EllipticCurveElement(this, x, ys[1])];
        } else {
            return undefined;
        }
    }

    public getAllElements(): EllipticCurveElement[] {
        const result = [this.identity];
        const fieldElements = this.field.getAllElements();
        for (const fieldElement of fieldElements) {
            const elements = this.getElements(fieldElement);
            if (elements !== undefined) {
                if (elements[0].equals(elements[1])) {
                    result.push(elements[0]);
                } else {
                    result.push(...elements);
                }
            }
        }
        return result;
    }

    public getRepetitionOrder(): bigint | null {
        if (this.order === undefined) {
            this.order = this.field.modulus.value < maxModulusForPointCounting ? BigInt(this.getAllElements().length) : null;
        }
        return this.order;
    }

    public areValidCoordinates(x: MultiplicativeRingElement, y: MultiplicativeRingElement): boolean {
        return y.square().equals(x.cube().add(this.a.multiply(x)).add(this.b));
    }

    private parsePointCoordinates(text: string): [MultiplicativeRingElement, MultiplicativeRingElement] {
        return text.replace('(', '').replace(')', '').split(text.includes(';') ? ';' : ',').map(part => this.field.getElementFromString(part)) as [MultiplicativeRingElement, MultiplicativeRingElement];
    }

    public areValidCoordinatesFromString(text: string): boolean {
        if (text.trim() === 'O') {
            return true;
        } else {
            const [x, y] = this.parsePointCoordinates(text);
            return this.areValidCoordinates(x, y);
        }
    }

    public getElementFromString(text: string): EllipticCurveElement {
        if (text.trim() === 'O') {
            return this.identity;
        } else {
            const [x, y] = this.parsePointCoordinates(text);
            return new EllipticCurveElement(this, x, y);
        }
    }

    public getElementFromStringX(x: string, even = true): EllipticCurveElement | undefined {
        const elements = this.getElements(this.field.getElementFromString(x));
        if (elements !== undefined) {
            return even ? elements[0] : elements[1];
        } else {
            return undefined;
        }
    }

    /**
     * Never returns the identity element.
     */
    public getRandomElement(): EllipticCurveElement {
        let elements;
        do {
            elements = this.getElements(this.field.getRandomElement());
        } while (elements === undefined);
        return getRandomElement(elements);
    }

    public equals(that: EllipticCurve): boolean {
        return this.field.equals(that.field) && this.a.equals(that.a) && this.b.equals(that.b);
    }

    public toString(): string {
        return `y^2 = x^3${this.a.toMonomialString('x')}${this.b.toMonomialString('')} over ${this.field.toString()}`;
    }

    public render(format: IntegerFormat = 'decimal'): ReactNode {
        return <Fragment>y<Exponent exponent="2"/> = x<Exponent exponent="3"/>{this.a.toMonomialNode('x')}{this.b.toMonomialNode('')} over {this.field.render(format)}</Fragment>;
    }

    public readonly combinationSymbol = <AdditionSign/>;
    public readonly inverseCombinationSymbol = <MinusSign/>;

    public renderAbstractEquality(): ReactNode {
        return '=';
    }

    public renderConcreteEquality(): ReactNode {
        return '=';
    }

    public renderRepetition(element: ReactNode, integer: number | bigint | ReactNode, parentheses = false, format: IntegerFormat = 'decimal', color?: Color): ReactNode {
        return <Fragment>{renderInteger(integer, format, parentheses, color)}{element}</Fragment>;
    }

    public estimateMaxElementWidth(format: IntegerFormat): number {
        return Math.ceil(estimateStringWidth('(, )') + 2 * estimateStringWidth(encodeInteger(this.field.modulus.value, format)));
    }
}

export class EllipticCurveElement extends GroupElement<EllipticCurve, EllipticCurveElement> {
    public constructor(
        group: EllipticCurve,
        public readonly x: MultiplicativeRingElement,
        public readonly y: MultiplicativeRingElement,
        public readonly infinity: boolean = false,
    ) {
        super(group);

        if (!infinity && !group.areValidCoordinates(x, y)) {
            throw new Error(`The point (${x}, ${y}) is not on the elliptic curve ${group}.`);
        }
    }

    public combine(that: EllipticCurveElement): EllipticCurveElement {
        if (this.infinity) {
            return that;
        } else if (that.infinity) {
            return this;
        } else if (this.equals(that.invert())) {
            return this.group.identity;
        } else {
            let s: MultiplicativeRingElement;
            if (this.equals(that)) {
                s = this.x.square().triple().add(this.group.a).divide(this.y.double());
            } else {
                s = that.y.subtract(this.y).divide(that.x.subtract(this.x));
            }
            const x = s.square().subtract(this.x).subtract(that.x);
            const y = this.x.subtract(x).multiply(s).subtract(this.y);
            return new EllipticCurveElement(this.group, x, y);
        }
    }

    public invert(): EllipticCurveElement {
        if (this.infinity) {
            return this;
        } else {
            return new EllipticCurveElement(this.group, this.x, this.y.invertAdditively());
        }
    }

    public toInteger(): bigint {
        return this.x.value;
    }

    public equals(that: EllipticCurveElement): boolean {
        return this.x.equals(that.x) && this.y.equals(that.y) && this.infinity === that.infinity;
    }

    public to(format: IntegerFormat): string {
        return this.infinity ? 'O' : `(${this.x.to(format)}${getListSeparator(format)} ${this.y.to(format)})`;
    }

    public render(format: IntegerFormat, color?: Color, partialColoring = false): ReactNode {
        const output = this.infinity ? 'O' : <Fragment>({this.x.render(format, partialColoring ? color : undefined)}<ListSeparator format={format}/> {this.y.render(format)})</Fragment>;
        return color && !partialColoring ? <span className={getColorClass(color)}>{output}</span> : output;
    }
}
