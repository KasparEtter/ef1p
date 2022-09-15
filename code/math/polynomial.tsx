/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { arrayEquals, filterUndefined, getLastElement, popFromArray, shorterAndLonger } from '../utility/array';
import { Equality } from '../utility/object';
import { regexIndexOf } from '../utility/string';

import { join } from '../react/utility';

import { Exponent } from './formatting';
import { minusSymbols, plusOrMinusRegex } from './integer';
import { determinePolynomialFormat, PolynomialFormat, splitVector, variableRegex } from './polynomial-format';
import { Ring, RingElement } from './ring';
import { getRandomInteger, halve, one, two, zero } from './utility';

/* ------------------------------ Rendering ------------------------------ */

function monomialToString<R extends Ring<R, E>, E extends RingElement<R, E>>(coefficient: E, degree: number): string | undefined {
    if (coefficient.isZero()) {
        return undefined;
    } else {
        return ((!coefficient.isOne() || degree === 0) ? coefficient.toString() : '')
            + ((degree > 0) ? 'x' : '')
            + ((degree > 1) ? '^' + degree : '');
    }
}

function monomialToNode<R extends Ring<R, E>, E extends RingElement<R, E>>(coefficient: E, degree: number): ReactNode {
    if (coefficient.isZero()) {
        return undefined;
    } else {
        return <Fragment>
            {(!coefficient.isOne() || degree === 0) && coefficient.toString()}
            {(degree > 0) && 'x'}
            {(degree > 1) && <Exponent exponent={degree}/>}
        </Fragment>;
    }
}

/* ------------------------------ Polynomial ------------------------------ */

export class Polynomial<R extends Ring<R, E>, E extends RingElement<R, E>> implements Equality<Polynomial<R, E>> {
    public constructor(
        public readonly field: R,
        public readonly coefficients: E[],
    ) {
        if (!field.isField()) {
            throw new Error(`The ring ${field} is not a field.`);
        }
        if (coefficients.length > 0 && getLastElement(coefficients).equals(field.zero)) {
            throw new Error(`The leading coefficient may not be zero.`);
        }
        if (!coefficients.every(coefficient => coefficient.ring.equals(field))) {
            throw new Error(`All coefficients have to belong to the same field.`);
        }
    }

    /**
     * Returns a new polynomial with the given coefficients in reverse order unless the reversion is disabled.
     */
    public static fromCoefficients<R extends Ring<R, E>, E extends RingElement<R, E>>(
        field: R,
        coefficients: number[],
        revert = true,
    ): Polynomial<R, E> {
        const elements = coefficients.map(coefficient => field.getElement(BigInt(coefficient)));
        if (revert) {
            elements.reverse();
        }
        return new Polynomial<R, E>(field, elements);
    }

    /**
     * Also works for negative integers.
     */
    public static fromInteger<R extends Ring<R, E>, E extends RingElement<R, E>>(
        field: R,
        integer: bigint,
    ): Polynomial<R, E> {
        const coefficients = new Array<E>();
        while (integer !== zero) {
            coefficients.push(field.getElement(integer % field.order));
            integer = integer / field.order;
        }
        return new Polynomial<R, E>(field, coefficients);
    }

    public static fromString<R extends Ring<R, E>, E extends RingElement<R, E>>(
        field: R,
        text: string,
    ): Polynomial<R, E> {
        text = text.trim();
        switch (determinePolynomialFormat(text)) {
            case 'hexadecimal': // intentional fallthrough
            case 'binary': // intentional fallthrough
            case 'decimal':
                return Polynomial.fromInteger(field, BigInt(text));
            case 'vector': {
                const coefficients = splitVector(text).map(coefficient => field.getElement(BigInt(coefficient))).reverse();
                return new Polynomial<R, E>(field, popFromArray(coefficients, field.zero));
            }
            case 'polynomial': {
                const coefficients = new Array<E>();
                while (text.length > 0) {
                    let negative = false;
                    if (minusSymbols.includes(text.charAt(0))) {
                        negative = true;
                        text = text.substring(1);
                    } else if (text.startsWith('+')) {
                        text = text.substring(1);
                    }
                    text = text.trim();
                    const index = regexIndexOf(text, plusOrMinusRegex);
                    let monomial: string;
                    if (index === -1) {
                        monomial = text;
                        text = '';
                    } else {
                        monomial = text.substring(0, index).trim();
                        text = text.substring(index);
                    }
                    const parts = monomial.split(variableRegex);
                    let exponent = 0;
                    if (parts.length > 1) {
                        if (parts[1].length === 0) {
                            exponent = 1;
                        } else {
                            exponent = Number(parts[1].replace('^', ''));
                        }
                    }
                    if (exponent >= coefficients.length) {
                        for (let i = coefficients.length; i <= exponent; i++) {
                            coefficients.push(field.zero);
                        }
                    }
                    let coefficient = parts[0].replace('{', '').replace('}', '').replace('*', '').trim();
                    if (coefficient.length === 0) {
                        coefficient = '1';
                    }
                    coefficients[exponent] = coefficients[exponent].add(field.getElement(BigInt((negative ? '-' : '') + coefficient)));
                }
                return new Polynomial<R, E>(field, popFromArray(coefficients, field.zero));
            }
        }
    }

    public static fromMultiplication<R extends Ring<R, E>, E extends RingElement<R, E>>(
        polynomials: Polynomial<R, E>[],
    ): Polynomial<R, E> {
        if (polynomials.length === 0) {
            throw new Error('At least one polynomial has to be provided.');
        }
        let result = polynomials[0];
        for (let i = 1; i < polynomials.length; i++) {
            result = result.multiply(polynomials[i]);
        }
        return result;
    }

    public static fromRandomness<R extends Ring<R, E>, E extends RingElement<R, E>>(
        field: R,
        length: number,
    ): Polynomial<R, E> {
        return new Polynomial<R, E>(field, popFromArray(Array.from({length}, _ => field.getRandomElement()), field.zero));
    }

    /**
     * Returns a new polynomial where the given element is the only root.
     */
    public static fromRoot<R extends Ring<R, E>, E extends RingElement<R, E>>(
        element: E,
    ): Polynomial<R, E> {
        return new Polynomial<R, E>(element.ring, [element.invertAdditively(), element.ring.one]);
    }

    public toInteger(): bigint {
        const coefficients = this.coefficients;
        let result = zero;
        let base = one;
        for (let i = 0; i < coefficients.length; i++) {
            result += base * coefficients[i].toInteger();
            base *= this.field.order;
        }
        return result;
    }

    public to(format: PolynomialFormat): string {
        switch (format) {
            case 'hexadecimal':
                return '0x' + this.toInteger().toString(16);
            case 'binary':
                return '0b' + this.toInteger().toString(2);
            case 'decimal':
                return this.toInteger().toString();
            case 'vector':
                if (this.coefficients.length === 0) {
                    return '[0]';
                } else if (this.coefficients.length === 1) {
                    return '[' + this.coefficients[0].toString() + ']';
                } else {
                    return this.coefficients.map(coefficient => coefficient.toString()).reverse().join(' ');
                }
            case 'polynomial':
                if (this.coefficients.length === 0) {
                    return '{0}';
                } else if (this.coefficients.length === 1) {
                    return '{' + this.coefficients[0].toString() + '}';
                } else {
                    return filterUndefined(this.coefficients.map(monomialToString)).reverse().join(' + ');
                }
        }
    }

    public renderAs(format: PolynomialFormat, parenthesesIfPolynomial = false): ReactNode {
        switch (format) {
            case 'vector':
                if (this.coefficients.length > 0) {
                    return this.coefficients.map(coefficient => coefficient.toString()).reverse().join(' ');
                } else {
                    return '0';
                }
            case 'polynomial':
                if (this.coefficients.length > 0) {
                    const result = join(filterUndefined(this.coefficients.map(monomialToNode)).reverse(), ' + ');
                    if (parenthesesIfPolynomial && !this.isMonomial()) {
                        return <Fragment>({result})</Fragment>;
                    } else {
                        return result;
                    }
                } else {
                    return '0';
                }
            default:
                return this.to(format);
        }
    }

    public toString(): string {
        return this.to('vector');
    }

    public getDegree(): bigint {
        return BigInt(this.coefficients.length - 1);
    }

    public getRingOrder(): bigint {
        return this.field.order ** this.getDegree();
    }

    public isZero(): boolean {
        return this.coefficients.length === 0;
    }

    public isConstant(): boolean {
        return this.coefficients.length < 2;
    }

    public isMonic(): boolean {
        return this.coefficients.length > 0 && getLastElement(this.coefficients).equals(this.field.one);
    }

    public isMonomial(): boolean {
        return this.coefficients.filter(coefficient => !coefficient.equals(this.field.zero)).length <= 1;
    }

    public isMultipleOfX(): boolean {
        return this.coefficients.length > 0 && this.coefficients[0].equals(this.field.zero);
    }

    public shiftLeft(amount: bigint): Polynomial<R, E> {
        if (this.coefficients.length > 0) {
            return new Polynomial<R, E>(this.field, new Array<E>(Number(amount)).fill(this.field.zero).concat(this.coefficients));
        } else {
            return this;
        }
    }

    public shiftRight(amount: bigint): Polynomial<R, E> {
        return new Polynomial<R, E>(this.field, this.coefficients.slice(Number(amount)));
    }

    public rotateLeft(length: bigint): Polynomial<R, E> {
        if (this.coefficients.length > 0) {
            const lastIndex = Number(length) - 1;
            const coefficients = this.coefficients.slice(0, lastIndex);
            coefficients.unshift(this.coefficients[lastIndex] ?? this.field.zero);
            return new Polynomial<R, E>(this.field, popFromArray(coefficients, this.field.zero));
        } else {
            return this;
        }
    }

    public introduceNoise(length: bigint): Polynomial<R, E> {
        const randomIndex = Number(getRandomInteger(zero, length - one));
        const coefficients = this.coefficients.slice();
        while (coefficients.length <= randomIndex) {
            coefficients.push(this.field.zero);
        }
        const currentCoefficient = coefficients[randomIndex];
        let randomCoefficient = this.field.getRandomElement();
        while (randomCoefficient.equals(currentCoefficient)) {
            randomCoefficient = this.field.getRandomElement();
        }
        coefficients[randomIndex] = randomCoefficient;
        return new Polynomial<R, E>(this.field, popFromArray(coefficients, this.field.zero));
    }

    // Using https://en.wikipedia.org/wiki/Horner%27s_method
    public evaluate(element: E): E {
        if (this.coefficients.length === 0) {
            return this.field.zero;
        } else {
            let result = getLastElement(this.coefficients);
            for (let i = this.coefficients.length - 2; i >= 0; i--) {
                result = result.multiply(element).add(this.coefficients[i]);
            }
            return result;
        }
    }

    public findRoots(): E[] {
        return this.field.getAllElements().filter(element => this.evaluate(element).isZero());
    }

    public add(that: Polynomial<R, E>): Polynomial<R, E> {
        const [shorter, longer] = shorterAndLonger(this.coefficients, that.coefficients);
        const coefficients = new Array<E>();
        for (let i = 0; i < shorter.length; i++) {
            coefficients.push(shorter[i].add(longer[i]));
        }
        for (let i = shorter.length; i < longer.length; i++) {
            coefficients.push(longer[i]);
        }
        return new Polynomial<R, E>(this.field, popFromArray(coefficients, this.field.zero));
    }

    public invertAdditively(): Polynomial<R, E> {
        return new Polynomial<R, E>(this.field, this.coefficients.map(coefficient => coefficient.invertAdditively()));
    }

    public subtract(that: Polynomial<R, E>): Polynomial<R, E> {
        return this.add(that.invertAdditively());
    }

    public multiply(that: Polynomial<R, E>): Polynomial<R, E> {
        if (this.isZero() || that.isZero()) {
            return new Polynomial<R, E>(this.field, []);
        }
        const [shorter, longer] = shorterAndLonger(this.coefficients, that.coefficients);
        const coefficients = new Array<E>(shorter.length + longer.length - 1).fill(this.field.zero);
        for (let i = 0; i < shorter.length; i++) {
            for (let j = 0; j < longer.length; j++) {
                coefficients[i + j] = coefficients[i + j].add(shorter[i].multiply(longer[j]));
            }
        }
        return new Polynomial<R, E>(this.field, coefficients);
    }

    public multiplyEachCoefficient(factor: E): Polynomial<R, E> {
        if (factor.isZero()) {
            throw new Error('The factor may not be zero.');
        }
        const coefficients = new Array<E>();
        for (let i = 0; i < this.coefficients.length; i++) {
            coefficients[i] = this.coefficients[i].multiply(factor);
        }
        return new Polynomial<R, E>(this.field, coefficients);
    }

    public makeMonic(): Polynomial<R, E> {
        if (this.coefficients.length === 0 || this.isMonic()) {
            return this;
        } else {
            return this.multiplyEachCoefficient(getLastElement(this.coefficients).invertMultiplicatively());
        }
    }

    // https://en.wikipedia.org/wiki/Polynomial_long_division#Pseudocode
    public divideWithRemainder(that: Polynomial<R, E>): [Polynomial<R, E>, Polynomial<R, E>] {
        if (that.isZero()) {
            throw new Error(`math/polynomial.tsx: Thou shalt not divide by zero.`);
        }
        const remainder = this.coefficients.slice();
        const divisor = that.coefficients;
        const inverse = getLastElement(divisor).invertMultiplicatively();
        const quotient = new Array<E>();
        while (remainder.length >= divisor.length) {
            const factor = getLastElement(remainder).multiply(inverse);
            const degree = remainder.length - divisor.length;
            if (degree >= quotient.length) {
                for (let i = quotient.length; i < degree; i++) {
                    quotient.push(this.field.zero);
                }
                quotient.push(factor);
            } else {
                quotient[degree] = quotient[degree].add(factor);
            }
            for (let i = degree; i < remainder.length; i++) {
                remainder[i] = remainder[i].subtract(divisor[i - degree].multiply(factor));
            }
            popFromArray(remainder, this.field.zero);
        }
        return [
            new Polynomial<R, E>(this.field, quotient),
            new Polynomial<R, E>(this.field, remainder),
        ];
    }

    public modulo(that: Polynomial<R, E>): Polynomial<R, E> {
        return this.divideWithRemainder(that)[1];
    }

    public isIrreducible(): boolean {
        if (this.getDegree() < two) {
            return true;
        }
        const limit = this.field.order ** halve(this.getDegree()) * two - one; // * two because we are interested only in monic polynomials.
        let value = this.field.order
        while (value <= limit) {
            const candidate = Polynomial.fromInteger<R, E>(this.field, value);
            if (candidate.isMonic()) {
                if (this.modulo(candidate).isZero()) {
                    return false;
                } else {
                    value++;
                }
            } else {
                value = this.field.order ** (candidate.getDegree() + one);
            }
        }
        return true;
    }

    public factorize(): Polynomial<R, E>[] {
        if (this.getDegree() < one) {
            return [this];
        }
        if (this.getDegree() === one) {
            if (this.coefficients[1].isOne()) {
                return [this];
            } else {
                const inverse = this.coefficients[1].invertMultiplicatively();
                return [this.multiplyEachCoefficient(inverse), new Polynomial(this.field, [inverse])];
            }
        }
        const limit = this.field.order ** halve(this.getDegree()) * two - one; // * two because we are interested only in monic polynomials.
        let value = this.field.order
        while (value <= limit) {
            const candidate = Polynomial.fromInteger<R, E>(this.field, value);
            if (candidate.isMonic()) {
                const [quotient, remainder] = this.divideWithRemainder(candidate);
                if (remainder.isZero()) {
                    return [candidate, ...quotient.factorize()];
                } else {
                    value++;
                }
            } else {
                value = this.field.order ** (candidate.getDegree() + one);
            }
        }
        return [this];
    }

    public getReciprocalPolynomial(): Polynomial<R, E> {
        return new Polynomial<R, E>(this.field, popFromArray(this.coefficients.slice().reverse(), this.field.zero));
    }

    /**
     * Returns whether this polynomial is a multiple of X or smaller than or equal to its reciprocal polynomial.
     */
    public isSmallerThanReciprocalPolynomial(): boolean {
        return this.isMultipleOfX() || this.toInteger() <= this.getReciprocalPolynomial().toInteger();
    }

    public getNextPolynomial(lengthLimit?: bigint): Polynomial<R, E> {
        const polynomial = Polynomial.fromInteger<R, E>(this.field, this.toInteger() + one);
        if (lengthLimit !== undefined && polynomial.getDegree() >= lengthLimit) {
            return new Polynomial<R, E>(this.field, []);
        } else {
            return polynomial;
        }
    }

    public getPreviousPolynomial(lengthLimit?: bigint): Polynomial<R, E> {
        const value = this.toInteger();
        if (value > zero) {
            return Polynomial.fromInteger<R, E>(this.field, this.toInteger() - one);
        } else if (lengthLimit !== undefined) {
            return Polynomial.fromInteger<R, E>(this.field, this.field.order ** lengthLimit - one);
        } else {
            return this;
        }
    }

    public getNextOrPreviousPolynomial(next: boolean, lengthLimit?: bigint): Polynomial<R, E> {
        return next ? this.getNextPolynomial(lengthLimit) : this.getPreviousPolynomial(lengthLimit);
    }

    public getNextIrreduciblePolynomial(monic = false, reciprocal = false): Polynomial<R, E> {
        let polynomial: Polynomial<R, E> = this;
        do {
            polynomial = polynomial.getNextPolynomial();
        } while (!(
            (!monic || polynomial.isMonic()) &&
            (!reciprocal || polynomial.isSmallerThanReciprocalPolynomial()) &&
            polynomial.isIrreducible()
        ));
        return polynomial;
    }

    public getPreviousIrreduciblePolynomial(monic = false, reciprocal = false): Polynomial<R, E> {
        let polynomial: Polynomial<R, E> = this;
        do {
            polynomial = polynomial.getPreviousPolynomial();
        } while (!(
            (!monic || polynomial.isMonic()) &&
            (!reciprocal || polynomial.isSmallerThanReciprocalPolynomial()) &&
            polynomial.isIrreducible()
        ));
        return polynomial;
    }

    public changeField<R1 extends Ring<R1, E1>, E1 extends RingElement<R1, E1>>(field: R1): Polynomial<R1, E1> {
        return new Polynomial<R1, E1>(field, this.coefficients.map(coefficient => field.getElement(coefficient.toInteger())));
    }

    public equals(that: Polynomial<R, E>): boolean {
        return this.field.equals(that.field) && arrayEquals(this.coefficients, that.coefficients);
    }
}
