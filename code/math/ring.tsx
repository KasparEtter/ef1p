/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { Color } from '../utility/color';

import { AlgebraicStructure, AlgebraicStructureElement } from './algebraic-structure';
import { encodeInteger, Integer } from './formatting';
import { IntegerFormat, ToInteger } from './integer';
import { ModularElement } from './modular-element';
import { PolynomialFormat } from './polynomial-format';
import { getRandomInteger, minusOne, modulo, one, two, zero } from './utility';

/**
 * We are interested only in finite, commutative rings, which are often small enough so that all elements can be returned.
 * We use bigint everywhere because the multiplicative ring is used with very large numbers when doing repetition arithmetic.
 */
export abstract class Ring<R extends Ring<R, E>, E extends RingElement<R, E>> extends AlgebraicStructure<R, E> {
    public abstract readonly modulus: E;
    public abstract readonly zero: E;
    public abstract readonly one: E;

    private readonly field: boolean;

    public constructor(
        public readonly order: bigint,
        public readonly characteristic: bigint,
        protected multiplicativeOrder?: bigint | null, // Has to be undefined initially if and only if the ring is not a field.
    ) {
        super();

        if (order < two) {
            throw new Error(`The additive order has to be at least 2 but was ${order}.`);
        }
        if (characteristic < two) {
            throw new Error(`The characteristic has to be at least 2 but was ${characteristic}.`);
        }
        if (multiplicativeOrder && multiplicativeOrder < one) {
            throw new Error(`The multiplicative order has to be at least 1 but was ${multiplicativeOrder}.`);
        }

        this.field = this.multiplicativeOrder !== undefined;
    }

    public getRepetitionIdentity(): E {
        return this.one;
    }

    public isField(): boolean {
        return this.field;
    }

    public toString(): string {
        return `${this.isField() ? 'F' : 'R'}(${this.order})`;
    }

    public render(format: IntegerFormat = 'decimal'): ReactNode {
        return <Fragment>{this.isField() ? '𝔽' : 'ℝ'}<sub><Integer integer={this.order} format={format}/></sub></Fragment>;
    }

    /**
     * Also works for negative values.
     */
    public abstract getElement(value: bigint): E;

    public getRandomElement(): E {
        return this.getElement(getRandomInteger(zero, this.order - one));
    }

    private getAllElementsFrom(startValue: bigint, coprimeOrZero = false): E[] {
        const elements = new Array<E>();
        for (let value = startValue; value < this.order; value++) {
            const element = this.getElement(value);
            if (!coprimeOrZero || element.isCoprimeWithModulus() || element.isZero()) {
                elements.push(element);
            }
        }
        return elements;
    }

    public getAllElements(coprimeOrZero = false): E[] {
        return this.getAllElementsFrom(zero, coprimeOrZero);
    }

    public getAllElementsExceptZero(coprimeOrZero = false): E[] {
        return this.getAllElementsFrom(one, coprimeOrZero);
    }
}

export abstract class RingElement<R extends Ring<R, E>, E extends RingElement<R, E>> extends AlgebraicStructureElement<R, E> implements ModularElement {
    public constructor(
        public readonly ring: R,
    ) {
        super();
    }

    protected getStructure(): R {
        return this.ring;
    }

    public isZero(): boolean {
        return this.equals(this.ring.zero);
    }

    public isOne(): boolean {
        return this.equals(this.ring.one);
    }

    public isModulus(): boolean {
        return this.equals(this.ring.modulus);
    }

    public abstract add(that: E | this): E;

    public increment(): E {
        return this.add(this.ring.one);
    }

    public double(): E {
        return this.add(this);
    }

    public triple(): E {
        return this.add(this.double());
    }

    public abstract invertAdditively(): E;

    public subtract(that: E): E {
        return this.add(that.invertAdditively());
    }

    public decrement(): E {
        return this.subtract(this.ring.one);
    }

    public abstract multiply(that: E | this): E;

    protected combine(that: E | this): E {
        return this.multiply(that);
    }

    public square(): E {
        return this.multiply(this);
    }

    public cube(): E {
        return this.multiply(this.square());
    }

    public exponentiate(integer: bigint | ToInteger): E | this {
        return this.repeat(integer);
    }

    /**
     * Returns whether this element generates the multiplicative group.
     * Returns false if the multiplicative order of the ring cannot be determined.
     */
    public isPrimitive(): boolean {
        return this.getOrder() === this.ring.getRepetitionOrder();
    }

    /**
     * This method may be called only if this element is not zero.
     */
    protected abstract determineAdditiveOrder(): bigint;

    public getAdditiveOrder(): bigint {
        if (this.isZero()) {
            return one;
        } else {
            return this.determineAdditiveOrder();
        }
    }

    /**
     * Returns the quotient and the remainder of the Euclidean division.
     * Please note that the quotient may violate the element normalization.
     */
    public abstract divideWithRemainder(that: E): [E, E];

    /**
     * Returns whether this element can be inverted without requiring the ring modulus.
     */
    protected abstract isUnitIgnoringModulus(): boolean;

    public isCoprimeWithModulus(): boolean {
        let oldRemainder = this.ring.modulus;
        let newRemainder = this as unknown as E;
        while (!newRemainder.isZero()) {
            [oldRemainder, newRemainder] = [newRemainder, oldRemainder.divideWithRemainder(newRemainder)[1]];
        }
        return oldRemainder.isUnitIgnoringModulus();
    }

    public isInvertible(): boolean {
        return this.ring.isField() ? !this.isZero() : this.isCoprimeWithModulus();
    }

    protected hasOrder(): boolean {
        return this.isInvertible();
    }

    /**
     * Normalizes this element with the given old remainder, which has to be a unit.
     */
    public abstract normalizeFactor(oldRemainder: E): E;

    /**
     * The inversion may fail for elements of a ring.
     * https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Computing_multiplicative_inverses_in_modular_structures
     */
    public invertMultiplicatively(): E {
        if (this.isZero() || this.isModulus()) {
            throw new Error(`You cannot invert zero or the ring modulus.`);
        }
        let oldRemainder = this.ring.modulus;
        let newRemainder = this as unknown as E;
        let oldFactor = this.ring.zero;
        let newFactor = this.ring.one;
        while (!newRemainder.isZero()) {
            const quotient = oldRemainder.divideWithRemainder(newRemainder)[0];
            [oldRemainder, newRemainder] = [newRemainder, oldRemainder.subtract(quotient.multiply(newRemainder))];
            [oldFactor, newFactor] = [newFactor, oldFactor.subtract(quotient.multiply(newFactor))];
        }
        if (oldRemainder.isUnitIgnoringModulus()) {
            return oldFactor.normalizeFactor(oldRemainder);
        } else {
            throw new Error(`${this.toString()} has no multiplicative inverse.`);
        }
    }

    protected invert(): E {
        return this.invertMultiplicatively();
    }

    /**
     * The division fails for elements which are not coprime with the modulus.
     */
    public divide(that: E): E {
        return this.multiply(that.invertMultiplicatively());
    }

    public toNumber(): number {
        return Number(this.toInteger());
    }

    public to(format: IntegerFormat): string {
        return encodeInteger(this.toInteger(), format);
    }

    public render(format: IntegerFormat, color?: Color): ReactNode {
        return <Integer integer={this} format={format} color={color}/>;
    }

    public abstract renderAs(format: PolynomialFormat, parenthesesIfPolynomial?: boolean): ReactNode;

    public getNextElement(): E {
        return this.ring.getElement(modulo(this.toInteger() + one, this.ring.order));
    }

    public getPreviousElement(): E {
        return this.ring.getElement(modulo(this.toInteger() - one, this.ring.order));
    }

    public getNextOrPreviousElement(next: boolean): E {
        return next ? this.getNextElement() : this.getPreviousElement();
    }

    public getNextPrimitiveElement(): E {
        let element: E | this = this;
        do {
            element = element.getNextElement();
        } while (!element.isPrimitive() && !this.equals(element));
        return element;
    }

    public getPreviousPrimitiveElement(): E {
        let element: E | this = this;
        do {
            element = element.getPreviousElement();
        } while (!element.isPrimitive() && !this.equals(element));
        return element;
    }

    public getNextOrPreviousPrimitiveElement(next: boolean): E {
        return next ? this.getNextPrimitiveElement() : this.getPreviousPrimitiveElement();
    }

    public getExponentiationsAndLogarithms(corrected = true): [E[], bigint[]] {
        if (this.isCoprimeWithModulus()) {
            let currentElement = this as unknown as E;
            const exponentiations = [currentElement];
            const logarithms = new Array<bigint>();
            logarithms[currentElement.toNumber()] = BigInt(exponentiations.length);
            while (!currentElement.isOne()) {
                currentElement = this.multiply(currentElement);
                exponentiations.push(currentElement);
                logarithms[currentElement.toNumber()] = BigInt(exponentiations.length);
            }
            if (corrected) {
                exponentiations.unshift(exponentiations.pop()!);
                logarithms[0] = minusOne;
                logarithms[1] = zero;
            }
            return [exponentiations, logarithms];
        } else {
            return [[], []];
        }
    }

    public getExponentiations(corrected = true): E[] {
        return this.getExponentiationsAndLogarithms(corrected)[0];
    }

    public getLogarithms(corrected = true): bigint[] {
        return this.getExponentiationsAndLogarithms(corrected)[1];
    }
}
