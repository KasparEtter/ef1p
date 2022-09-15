/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ReactNode } from 'react';

import { Color } from '../utility/color';

import { AlgebraicStructure, AlgebraicStructureElement } from './algebraic-structure';
import { IntegerFormat, ToInteger } from './integer';
import { one } from './utility';

export abstract class Group<G extends Group<G, E>, E extends GroupElement<G, E>> extends AlgebraicStructure<G, E> {
    public constructor(
        protected order?: bigint | null,
    ) {
        super();

        if (order && order < one) {
            throw new Error(`The order has to be at least one but was ${order}.`);
        }
    }

    public abstract readonly identity: E;

    public getRepetitionIdentity(): E {
        return this.identity;
    }

    public getRepetitionOrder(): bigint | null {
        return this.order ?? null;
    }

    public abstract readonly combinationSymbol: ReactNode;
    public abstract readonly inverseCombinationSymbol: ReactNode;

    public abstract renderAbstractEquality(character: ReactNode): ReactNode;

    public abstract renderConcreteEquality(format: IntegerFormat): ReactNode;

    public abstract renderRepetition(element: ReactNode, integer: number | bigint | ReactNode, parentheses?: boolean, format?: IntegerFormat, color?: Color): ReactNode;

    public abstract estimateMaxElementWidth(format: IntegerFormat): number;
}

export abstract class GroupElement<G extends Group<G, E>, E extends GroupElement<G, E>> extends AlgebraicStructureElement<G, E> {
    public constructor(
        public readonly group: G,
    ) {
        super();
    }

    protected getStructure(): G {
        return this.group;
    }

    public isIdentity(): boolean {
        return this.equals(this.group.identity);
    }

    public abstract combine(that: E | this): E;

    public abstract invert(): E;

    public repeat(integer: bigint | ToInteger): E {
        return super.repeat(integer);
    }

    public abstract render(format: IntegerFormat, color?: Color, partialColoring?: boolean): ReactNode;

    public renderRepetition(integer: number | bigint | ReactNode, format: IntegerFormat = 'decimal', parentheses = false, color?: Color): ReactNode {
        return this.group.renderRepetition(this.render(format), integer, parentheses, format, color);
    }
}
