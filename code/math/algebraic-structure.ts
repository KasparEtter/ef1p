/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ReactNode } from 'react';

import { Color } from '../utility/color';
import { Equality, StrictEquality } from '../utility/object';

import { Factor, factorize } from './factorization';
import { encodeInteger } from './formatting';
import { IntegerFormat, normalizeToInteger, ToInteger } from './integer';
import { halve, isOdd, zero } from './utility';

export abstract class AlgebraicStructure<S extends AlgebraicStructure<S, E>, E extends AlgebraicStructureElement<S, E>> implements Equality<S> {
    public abstract getRepetitionIdentity(): E;

    public abstract getRepetitionOrder(): bigint | null;

    private repetitionOrderFactors?: Factor[] | null;

    public getRepetitionOrderFactors(): Factor[] | null {
        if (this.repetitionOrderFactors === undefined) {
            const repetitionOrder = this.getRepetitionOrder();
            this.repetitionOrderFactors = repetitionOrder ? factorize(repetitionOrder) : null;
        }
        return this.repetitionOrderFactors;
    }

    public abstract getElementFromString(text: string): E;

    public abstract getRandomElement(): E;

    public abstract getAllElements(): E[];

    public abstract equals(that: S): boolean;

    public abstract toString(): string;

    public abstract render(format: IntegerFormat): ReactNode;
}

export abstract class AlgebraicStructureElement<S extends AlgebraicStructure<S, E>, E extends AlgebraicStructureElement<S, E>> implements ToInteger, StrictEquality<E> {
    protected abstract getStructure(): S;

    protected abstract combine(that: E | this): E;

    /**
     * The inversion may throw an error.
     */
    protected abstract invert(): E;

    public abstract toInteger(): bigint;

    protected repeat(integer: bigint | ToInteger): E {
        integer = normalizeToInteger(integer);
        let A: E = this as unknown as E;
        if (integer < zero) {
            A = A.invert();
            integer = -integer;
        }
        let B = this.getStructure().getRepetitionIdentity();
        while (integer > zero) {
            if (isOdd(integer)) {
                B = B.combine(A);
            }
            A = A.combine(A);
            integer = halve(integer);
        }
        return B;
    }

    public abstract equals(that: E): boolean;

    public strictlyEquals(that: E): boolean {
        return this.equals(that) && this.getStructure().equals(that.getStructure());
    }

    protected hasOrder(): boolean {
        return true;
    }

    /**
     * Returns the (in the case of rings multiplicative) order of this element.
     * If this element has no order (in the case of rings), zero is returned.
     * This method throws an error if the order cannot be determined.
     */
    public getOrder(): bigint {
        if (!this.hasOrder()) {
            return zero;
        }
        const repetitionOrderFactors = this.getStructure().getRepetitionOrderFactors();
        if (repetitionOrderFactors === null) {
            throw new Error(`Cannot determine the order of ${encodeInteger(this)}.`);
        }
        const repetitionIdentity = this.getStructure().getRepetitionIdentity();
        const repetitionOrder = this.getStructure().getRepetitionOrder()!;
        let order = repetitionOrder;
        for (const repetitionOrderFactor of repetitionOrderFactors) {
            order = order / (repetitionOrderFactor.base ** repetitionOrderFactor.exponent);
            let element = this.repeat(order);
            while (!element.equals(repetitionIdentity)) {
                element = element.repeat(repetitionOrderFactor.base);
                order = order * repetitionOrderFactor.base;
            }
        }
        return order;
    }

    public abstract to(format: IntegerFormat): string;

    public toString(): string {
        return this.to('raw'); // Has to be raw for polynomials to work correctly.
    }

    public abstract render(format?: IntegerFormat, color?: Color): ReactNode;
}
