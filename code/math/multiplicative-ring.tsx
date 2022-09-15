/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { sortIntegers } from '../utility/array';

import { factorize, phi } from './factorization';
import { AdditionSign, MinusSign } from './formatting';
import { decodeInteger } from './integer';
import { PolynomialFormat } from './polynomial-format';
import { Ring, RingElement } from './ring';
import { bezoutsIdentity, four, halve, isEven, leastCommonMultiple, modulo, one, two, zero } from './utility';

export class MultiplicativeRing extends Ring<MultiplicativeRing, MultiplicativeRingElement> {
    public readonly modulus: MultiplicativeRingElement;
    public readonly zero: MultiplicativeRingElement;
    public readonly one: MultiplicativeRingElement;

    public constructor(
        modulus: bigint,
        multiplicativeOrder?: bigint,
    ) {
        super(modulus, modulus, multiplicativeOrder);

        this.modulus = new MultiplicativeRingElement(this, modulus, true);
        // The following properties have to be initialized after the modulus,
        // which prevents us from using property initializers above.
        this.zero = new MultiplicativeRingElement(this, zero);
        this.one = new MultiplicativeRingElement(this, one);
    }

    public static fromPrime(modulus: bigint): MultiplicativeRing {
        return new MultiplicativeRing(modulus, modulus - one);
    }

    public getRepetitionOrder(): bigint | null {
        if (this.multiplicativeOrder === undefined) {
            const factors = factorize(this.order);
            this.multiplicativeOrder = factors ? phi(factors) : null;
        }
        return this.multiplicativeOrder;
    }

    public getElement(value: bigint): MultiplicativeRingElement {
        return new MultiplicativeRingElement(this, modulo(value, this.modulus.value));
    }

    public getElementFromString(text: string): MultiplicativeRingElement {
        return this.getElement(decodeInteger(text));
    }

    private quadraticNonResidue?: MultiplicativeRingElement;

    public getQuadraticNonResidue(): MultiplicativeRingElement {
        if (this.quadraticNonResidue !== undefined) {
            return this.quadraticNonResidue;
        }
        for (let value = two; value < this.modulus.value; value++) {
            const element = this.getElement(value);
            if (!element.isQuadraticResidue()) {
                this.quadraticNonResidue = element;
                return element;
            }
        }
        throw new Error(`Could not find a quadratic non-residue, which should never happen.`);
    }

    public equals(that: MultiplicativeRing): boolean {
        return this.modulus.equals(that.modulus);
    }
}

export class MultiplicativeRingElement extends RingElement<MultiplicativeRing, MultiplicativeRingElement> {
    public constructor(
        ring: MultiplicativeRing,
        public readonly value: bigint,
        ignoreNormalization = false,
    ) {
        super(ring);

        if (value < zero || !ignoreNormalization && value >= ring.modulus.value) {
            throw new Error(`The value ${value} has not been normalized for the ring modulus ${ring.modulus}.`);
        }
    }

    public add(that: MultiplicativeRingElement): MultiplicativeRingElement {
        return new MultiplicativeRingElement(this.ring, (this.value + that.value) % this.ring.modulus.value);
    }

    public invertAdditively(): MultiplicativeRingElement {
        return new MultiplicativeRingElement(this.ring, this.value === zero ? zero : this.ring.modulus.value - this.value);
    }

    public multiply(that: MultiplicativeRingElement): MultiplicativeRingElement {
        return new MultiplicativeRingElement(this.ring, (this.value * that.value) % this.ring.modulus.value);
    }

    private additiveOrder: bigint | undefined;

    protected determineAdditiveOrder(): bigint {
        if (this.additiveOrder === undefined) {
            this.additiveOrder = leastCommonMultiple(this.ring.modulus.value, this.value) / this.value;
        }
        return this.additiveOrder;
    }

    public divideWithRemainder(that: MultiplicativeRingElement): [MultiplicativeRingElement, MultiplicativeRingElement] {
        return [
            new MultiplicativeRingElement(this.ring, this.value / that.value, true), // The quotient is equal to the modulus if the other value is one.
            new MultiplicativeRingElement(this.ring, this.value % that.value),
        ];
    }

    public isUnitIgnoringModulus(): boolean {
        return this.isOne();
    }

    public normalizeFactor(): MultiplicativeRingElement {
        return this;
    }

    public isQuadraticResidue(): boolean {
        if (!this.ring.isField() || isEven(this.ring.modulus.value)) {
            throw new Error(`The modulus ${this.ring.modulus} has to be an odd prime.`);
        }
        return this.exponentiate((this.ring.modulus.value - one) / two).isOne();
    }

    public getNextQuadraticResidue(): MultiplicativeRingElement {
        let element: MultiplicativeRingElement = this;
        do {
            element = element.getNextElement();
        } while (!element.isQuadraticResidue());
        return element;
    }

    public getPreviousQuadraticResidue(): MultiplicativeRingElement {
        let element: MultiplicativeRingElement = this;
        do {
            element = element.getPreviousElement();
        } while (!element.isQuadraticResidue());
        return element;
    }

    public getNextOrPreviousQuadraticResidue(next: boolean): MultiplicativeRingElement {
        return next ? this.getNextQuadraticResidue() : this.getPreviousQuadraticResidue();
    }

    /**
     * Returns the two square roots of this element if they exist and undefined otherwise.
     * The first returned element is even and the second uneven, unless this element is zero.
     */
    public squareRoots(): [MultiplicativeRingElement, MultiplicativeRingElement] | undefined {
        if (!this.ring.isField() || isEven(this.ring.modulus.value)) {
            throw new Error(`The modulus ${this.ring.modulus} has to be an odd prime.`);
        }
        // Zero is not a quadratic residue and is best handled separately.
        if (this.isZero()) {
            return [this, this];
        } else if ((this.ring.modulus.value + one) % four === zero) {
            const result1 = this.exponentiate((this.ring.modulus.value + one) / four);
            if (this.equals(result1.square())) {
                const result2 = result1.invertAdditively();
                return isEven(result1.value) ? [result1, result2] : [result2, result1];
            } else {
                return undefined;
            }
        } else if (this.isQuadraticResidue()) {
            // https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm
            let Q = this.ring.modulus.value - one;
            let S = zero;
            while (isEven(Q)) {
                Q = halve(Q);
                S++;
            }
            const z = this.ring.getQuadraticNonResidue();
            let M = S;
            let c = z.exponentiate(Q);
            let t = this.exponentiate(Q);
            let R = this.exponentiate((Q + one) / two);
            while (!t.isOne()) {
                let i = one;
                let t2 = t.square();
                while (!t2.isOne()) {
                    t2 = t2.square();
                    i++;
                }
                const b = c.exponentiate(two ** (M - i - one));
                M = i;
                c = b.square();
                t = t.multiply(c);
                R = R.multiply(b);
            }
            // if (!this.equals(R.squared())) {
            //     throw new Error(`${R} is not a square root of ${this} modulo ${this.ring.modulus}.`);
            // }
            const R2 = R.invertAdditively();
            return isEven(R.value) ? [R, R2] : [R2, R];
        } else {
            return undefined;
        }
    }

    /**
     * Returns all the factors so that this.multiply(factor).equals(that).
     */
    public getFactorsTo(that: MultiplicativeRingElement): MultiplicativeRingElement[] {
        const m = this.ring.modulus.value;
        const a = this.value;
        const d = that.value;
        const [b, _, gcd] = bezoutsIdentity(a, m);
        if (d % gcd !== zero) {
            return [];
        }
        const c = modulo(b * d / gcd, m);
        const o = m / gcd;
        const cs = sortIntegers(Array.from({ length: Number(gcd) }, (_, i) => (c + BigInt(i) * o) % m));
        return cs.map(integer => new MultiplicativeRingElement(this.ring, integer));
    }

    public equals(that: MultiplicativeRingElement): boolean {
        return this.value === that.value;
    }

    public toInteger(): bigint {
        return this.value;
    }

    public toIntegerAroundZero(): bigint {
        if (this.value > halve(this.ring.modulus.value)) {
            return this.value - this.ring.modulus.value;
        } else {
            return this.value;
        }
    }

    public toMonomialString(variable: string): string {
        if (this.isZero()) {
            return '';
        } else {
            let value = this.value;
            let negative = false;
            if (value > halve(this.ring.modulus.value)) {
                value = this.ring.modulus.value - value;
                negative = true;
            }
            return (negative ? ' - ' : ' + ') + (value !== one || variable === '' ? value.toString() : '') + variable;
        }
    }

    public toMonomialNode(variable: string): ReactNode {
        if (this.isZero()) {
            return '';
        } else {
            let value = this.value;
            let negative = false;
            if (value > halve(this.ring.modulus.value)) {
                value = this.ring.modulus.value - value;
                negative = true;
            }
            return <Fragment>{negative ? <MinusSign/> : <AdditionSign/>}{value !== one || variable === '' ? value.toString() : ''}{variable}</Fragment>;
        }
    }

    public renderAs(format: PolynomialFormat): string {
        switch (format) {
            case 'hexadecimal':
                return '0x' + this.value.toString(16);
            case 'binary':
                return '0b' + this.value.toString(2);
            default:
                return this.value.toString();
        }
    }
}
