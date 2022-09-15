/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { Color } from '../utility/color';

import { factorize, phi } from './factorization';
import { DivisionSign, Exponent, Integer, MultiplicationSign, renderInteger } from './formatting';
import { IntegerFormat } from './integer';
import { ModularGroup, ModularGroupElement } from './modular-group';
import { areCoprime, four, getRandomInteger, modulo, multiplicativeInverse, one, two } from './utility';

export class MultiplicativeGroup extends ModularGroup<MultiplicativeGroup, MultiplicativeGroupElement> {
    public constructor(
        /**
         * The modulus doesn't have to be prime so that we can also support the RSA cryptosystem.
         */
        modulus: bigint,
        order?: bigint, // Cannot be computed for the RSA group of someone else.
    ) {
        super(modulus, order);

        if (modulus < two) {
            throw new Error(`The modulus has to be at least two but was ${modulus}.`);
        }
    }

    public static fromPrime(modulus: bigint): MultiplicativeGroup {
        return new MultiplicativeGroup(modulus, modulus - one);
    }

    public readonly identity = new MultiplicativeGroupElement(this, one);

    public getRepetitionOrder(): bigint | null {
        if (this.order === undefined) {
            const factors = factorize(this.modulus);
            this.order = factors ? phi(factors) : null;
        }
        return this.order;
    }

    /**
     * We do not enforce that the given value is coprime with the group modulus.
     */
    public getElement(value: bigint): MultiplicativeGroupElement {
        return new MultiplicativeGroupElement(this, modulo(value, this.modulus));
    }

    public getAllElements(onlyCoprimeOrZero = true, startValue = this.identity.value): MultiplicativeGroupElement[] {
        return super.getAllElements(onlyCoprimeOrZero, startValue);
    }

    public getRandomElement(): MultiplicativeGroupElement {
        let value = getRandomInteger(one, this.modulus - one);
        while (!areCoprime(this.modulus, value)) {
            value = getRandomInteger(one, this.modulus - one);
        }
        return new MultiplicativeGroupElement(this, value);
    }

    public isCyclic(): boolean | null {
        if (this.modulus === two || this.modulus === four) {
            return true;
        }
        // This could be implemented more efficiently without factorization,
        // but we need the answer only when we need the factorization anyway.
        const factors = factorize(this.modulus);
        if (factors === null) {
            return null;
        }
        if (factors.length === 1) {
            return factors[0].base !== two;
        } else if (factors.length === 2) {
            return factors[0].base === two && factors[0].exponent === one;
        } else {
            return false;
        }
    }

    public render(format: IntegerFormat = 'decimal'): ReactNode {
        return <Fragment>ℤ<sup className="out-of-flow">×</sup><sub><Integer integer={this.modulus} format={format}/></sub></Fragment>;
    }

    public readonly combinationSymbol = <MultiplicationSign/>;
    public readonly inverseCombinationSymbol = <DivisionSign/>;

    public renderRepetition(element: ReactNode, integer: number | bigint | ReactNode, parentheses = false, format: IntegerFormat = 'decimal', color?: Color): ReactNode {
        return <Fragment>{element}<Exponent exponent={renderInteger(integer, format, false, color)} parenthesesIfNotRaised={parentheses}/></Fragment>;
    }
}

export class MultiplicativeGroupElement extends ModularGroupElement<MultiplicativeGroup, MultiplicativeGroupElement> {
    public constructor(
        group: MultiplicativeGroup,
        value: bigint,
    ) {
        super(group, value);
    }

    public combine(that: MultiplicativeGroupElement): MultiplicativeGroupElement {
        return new MultiplicativeGroupElement(this.group, (this.value * that.value) % this.group.modulus);
    }

    protected hasOrder(): boolean {
        return this.isCoprimeWithModulus();
    }

    public invert(): MultiplicativeGroupElement {
        return new MultiplicativeGroupElement(this.group, multiplicativeInverse(this.value, this.group.modulus));
    }

    public getNextElement(): MultiplicativeGroupElement {
        let value = this.value;
        do {
            value = (value + one) % this.group.modulus;
        } while (!areCoprime(this.group.modulus, value));
        return new MultiplicativeGroupElement(this.group, value);
    }

    public getPreviousElement(): MultiplicativeGroupElement {
        let value = this.value;
        do {
            value = modulo(value - one, this.group.modulus);
        } while (!areCoprime(this.group.modulus, value));
        return new MultiplicativeGroupElement(this.group, value);
    }

    public getNextOrPreviousElement(next: boolean): MultiplicativeGroupElement {
        return next ? this.getNextElement() : this.getPreviousElement();
    }
}
