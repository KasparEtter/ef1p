/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { Color } from '../utility/color';
import { estimateStringWidth } from '../utility/string-width';

import { encodeInteger, Integer } from './formatting';
import { Group, GroupElement } from './group';
import { decodeInteger, IntegerFormat } from './integer';
import { ModularElement } from './modular-element';
import { areCoprime, one, zero } from './utility';

export abstract class ModularGroup<G extends ModularGroup<G, E>, E extends ModularGroupElement<G, E>> extends Group<G, E> {
    public constructor(
        public readonly modulus: bigint,
        order?: bigint | null,
    ) {
        super(order);
    }

    public abstract getElement(value: bigint): E;

    public getAllElements(onlyCoprimeOrZero = false, startValue = this.identity.value): E[] {
        const elements = new Array<E>();
        for (let value = startValue; value < this.modulus; value++) {
            if (!onlyCoprimeOrZero || value === zero || areCoprime(this.modulus, value)) {
                elements.push(this.getElement(value));
            }
        }
        return elements;
    }

    public getElementFromString(text: string): E {
        return this.getElement(decodeInteger(text));
    }

    public equals(that: G): boolean {
        return this.modulus === that.modulus;
    }

    public toString(): string {
        return `G(${this.modulus})`;
    }

    public renderAbstractEquality(character: ReactNode): ReactNode {
        return <Fragment>=<sub>{character}</sub></Fragment>;
    }

    public renderConcreteEquality(format: IntegerFormat): ReactNode {
        return <Fragment>=<sub><Integer integer={this.modulus} format={format}/></sub></Fragment>;
    }

    public estimateMaxElementWidth(format: IntegerFormat): number {
        return Math.ceil(estimateStringWidth(encodeInteger(this.modulus, format)));
    }
}

export abstract class ModularGroupElement<G extends ModularGroup<G, E>, E extends ModularGroupElement<G, E>> extends GroupElement<G, E> implements ModularElement {
    public constructor(
        group: G,
        public readonly value: bigint,
    ) {
        super(group);

        if (value < zero || value >= group.modulus) {
            throw new Error(`The value ${value} has not been normalized for the group modulus ${group.modulus}.`);
        }
    }

    public isZero(): boolean {
        return this.value === zero;
    }

    public isOne(): boolean {
        return this.value === one;
    }

    public isCoprimeWithModulus(): boolean {
        return areCoprime(this.group.modulus, this.value);
    }

    public toInteger(): bigint {
        return this.value;
    }

    public equals(that: E): boolean {
        return this.value === that.value;
    }

    public to(format: IntegerFormat): string {
        return encodeInteger(this.value, format);
    }

    public render(format: IntegerFormat, color?: Color): ReactNode {
        return <Integer integer={this} format={format} color={color}/>;
    }
}
