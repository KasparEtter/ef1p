/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { IntegerFormat } from './integer';
import { Polynomial } from './polynomial';
import { PolynomialFormat } from './polynomial-format';
import { Ring, RingElement } from './ring';
import { hundred, one, zero } from './utility';

export class ExtensionRing<R extends Ring<R, E>, E extends RingElement<R, E>> extends Ring<ExtensionRing<R, E>, ExtensionRingElement<R, E>> {
    public readonly modulus: ExtensionRingElement<R, E>;
    public readonly zero: ExtensionRingElement<R, E>;
    public readonly one: ExtensionRingElement<R, E>;

    public constructor(
        modulus: Polynomial<R, E>,
    ) {
        super(
            modulus.getRingOrder(),
            modulus.field.characteristic,
            modulus.isIrreducible() ? modulus.getRingOrder() - one : undefined,
        );

        if (modulus.isConstant()) {
            throw new Error(`The modulus polynomial may not be constant but was ${modulus.getDegree()}.`);
        }

        this.modulus = new ExtensionRingElement(this, modulus, true);
        // The following properties have to be initialized after the modulus,
        // which prevents us from using property initializers above.
        this.zero = new ExtensionRingElement(this, Polynomial.fromInteger(modulus.field, zero));
        this.one = new ExtensionRingElement(this, Polynomial.fromInteger(modulus.field, one));
    }

    public getRepetitionOrder(): bigint | null {
        if (this.multiplicativeOrder === undefined) {
            this.multiplicativeOrder = this.order < hundred ? BigInt(this.getAllElementsExceptZero(true).length) : null;
        }
        return this.multiplicativeOrder;
    }

    public getBaseField(): R {
        return this.modulus.polynomial.field;
    }

    public getElement(value: bigint): ExtensionRingElement<R, E> {
        return new ExtensionRingElement(this, Polynomial.fromInteger<R, E>(this.modulus.polynomial.field, value).modulo(this.modulus.polynomial));
    }

    public getElementFromString(text: string): ExtensionRingElement<R, E> {
        return new ExtensionRingElement(this, Polynomial.fromString<R, E>(this.modulus.polynomial.field, text).modulo(this.modulus.polynomial));
    }

    public equals(that: ExtensionRing<R, E>): boolean {
        return this.modulus.equals(that.modulus);
    }

    public render(format: IntegerFormat): ReactNode {
        return <Fragment>{super.render(format)} modulo {this.modulus.renderAs('polynomial')} over {this.modulus.polynomial.field.render(format)}</Fragment>;
    }
}

export class ExtensionRingElement<R extends Ring<R, E>, E extends RingElement<R, E>> extends RingElement<ExtensionRing<R, E>, ExtensionRingElement<R, E>> {
    public constructor(
        ring: ExtensionRing<R, E>,
        public readonly polynomial: Polynomial<R, E>,
        ignoreNormalization = false,
    ) {
        super(ring);

        if (!ignoreNormalization && polynomial.getDegree() >= ring.modulus.polynomial.getDegree()) {
            throw new Error(`The polynomial ${polynomial} has not been normalized for the reducing polynomial ${ring.modulus}.`);
        }
    }

    public add(that: ExtensionRingElement<R, E>): ExtensionRingElement<R, E> {
        return new ExtensionRingElement(this.ring, this.polynomial.add(that.polynomial).modulo(this.ring.modulus.polynomial));
    }

    public invertAdditively(): ExtensionRingElement<R, E> {
        return new ExtensionRingElement(this.ring, this.polynomial.invertAdditively());
    }

    public multiply(that: ExtensionRingElement<R, E>): ExtensionRingElement<R, E> {
        return new ExtensionRingElement(this.ring, this.polynomial.multiply(that.polynomial).modulo(this.ring.modulus.polynomial));
    }

    protected determineAdditiveOrder(): bigint {
        return this.ring.characteristic;
    }

    public divideWithRemainder(that: ExtensionRingElement<R, E>): [ExtensionRingElement<R, E>, ExtensionRingElement<R, E>] {
        const [quotient, remainder] = this.polynomial.divideWithRemainder(that.polynomial);
        return [
            new ExtensionRingElement(this.ring, quotient, true), // The quotient has the same degree as the modulus if the other polynomial is constant.
            new ExtensionRingElement(this.ring, remainder),
        ];
    }

    public isUnitIgnoringModulus(): boolean {
        return this.polynomial.isConstant();
    }

    public normalizeFactor(oldRemainder: ExtensionRingElement<R, E>): ExtensionRingElement<R, E> {
        const inverse = oldRemainder.polynomial.coefficients[0].invertMultiplicatively();
        return new ExtensionRingElement(this.ring, this.polynomial.multiplyEachCoefficient(inverse));
    }

    public equals(that: ExtensionRingElement<R, E>): boolean {
        return this.polynomial.equals(that.polynomial);
    }

    public toInteger(): bigint {
        return this.polynomial.toInteger();
    }

    public renderAs(format: PolynomialFormat, parenthesesIfPolynomial = false): ReactNode {
        return this.polynomial.renderAs(format, parenthesesIfPolynomial);
    }
}
