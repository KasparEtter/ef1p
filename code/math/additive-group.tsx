/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { Color } from '../utility/color';

import { AdditionSign, Integer, MinusSign, renderInteger } from './formatting';
import { IntegerFormat } from './integer';
import { ModularGroup, ModularGroupElement } from './modular-group';
import { getRandomInteger, modulo, one, zero } from './utility';

export class AdditiveGroup extends ModularGroup<AdditiveGroup, AdditiveGroupElement> {
    public constructor(
        modulus: bigint,
    ) {
        super(modulus, modulus);

        if (modulus < one) {
            throw new Error(`The modulus has to be at least one but was ${modulus}.`);
        }
    }

    public readonly identity = new AdditiveGroupElement(this, zero);

    public getElement(value: bigint): AdditiveGroupElement {
        return new AdditiveGroupElement(this, modulo(value, this.modulus));
    }

    public getRandomElement(): AdditiveGroupElement {
        return this.getElement(getRandomInteger(zero, this.modulus - one));
    }

    public render(format: IntegerFormat = 'decimal'): ReactNode {
        return <Fragment>ℤ<sup className="out-of-flow"><AdditionSign noSpaces/></sup><sub><Integer integer={this.modulus} format={format}/></sub></Fragment>;
    }

    public readonly combinationSymbol = <AdditionSign/>;
    public readonly inverseCombinationSymbol = <MinusSign/>;

    public renderRepetition(element: ReactNode, integer: number | bigint | ReactNode, parentheses = false, format: IntegerFormat = 'decimal', color?: Color): ReactNode {
        return <Fragment>{renderInteger(integer, format, parentheses, color)}{element}</Fragment>;
    }
}

export class AdditiveGroupElement extends ModularGroupElement<AdditiveGroup, AdditiveGroupElement> {
    public constructor(
        group: AdditiveGroup,
        value: bigint,
    ) {
        super(group, value);
    }

    public combine(that: AdditiveGroupElement): AdditiveGroupElement {
        return new AdditiveGroupElement(this.group, (this.value + that.value) % this.group.modulus);
    }

    public invert(): AdditiveGroupElement {
        return this.value === zero ? this : new AdditiveGroupElement(this.group, this.group.modulus - this.value);
    }
}
