/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { join } from '../../react/utility';

import { Factor, factorize } from '../../math/factorization';
import { Exponent, Integer, MultiplicationSign } from '../../math/formatting';
import { IntegerFormat } from '../../math/integer';
import { one } from '../../math/utility';

export function renderFactor(factor: Factor, format: IntegerFormat = 'decimal'): ReactNode {
    return <Fragment>
        <Integer integer={factor.base} format={format}/>
        {(factor.exponent > one) && <Exponent exponent={<Integer integer={factor.exponent} format={format}/>}/>}
    </Fragment>;
}

export function renderFactors(factors: Factor[], format: IntegerFormat = 'decimal'): ReactNode {
    return join(factors.map(factor => renderFactor(factor, format)), <MultiplicationSign/>);
}

export function renderFactorsOrPrime(factors: Factor[], format: IntegerFormat = 'decimal'): ReactNode {
    if (factors.length === 1 && factors[0].exponent === one) {
        return 'is prime';
    } else {
        return <Fragment>= {renderFactors(factors, format)}</Fragment>;
    }
}

export function renderFactorization(integer: number | bigint, format: IntegerFormat = 'decimal'): ReactNode {
    const factors = factorize(BigInt(integer));
    return <Fragment><Integer integer={integer} format={format}/> {factors ? renderFactorsOrPrime(factors, format) : 'could not be factorized'}</Fragment>;
}
