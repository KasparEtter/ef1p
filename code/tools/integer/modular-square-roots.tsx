/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { sortIntegers, unique } from '../../utility/array';

import { ClickToCopy } from '../../react/copy';
import { DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { join } from '../../react/utility';
import { VersionedStore } from '../../react/versioned-store';

import { factorize } from '../../math/factorization';
import { Exponent, Integer } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat } from '../../math/integer';
import { MultiplicativeRing } from '../../math/multiplicative-ring';
import { chineseRemainder, eight, four, halve, halveRoundedUp, isEven, max, modulo, one, three, two, zero } from '../../math/utility';

import { renderFactorsOrPrime } from '../utility/factors';
import { integerGreaterOne, nonNegativeInteger } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

const inputWidth = 290;

const m: DynamicTextEntry<State> = {
    ...integerGreaterOne,
    label: 'Modulus m',
    defaultValue: '72',
    inputWidth,
};

const a: DynamicTextEntry<State> = {
    ...nonNegativeInteger,
    label: 'Input a',
    tooltip: 'The integer whose square roots modulo m you want to determine.',
    defaultValue: '28',
    inputWidth,
};

interface State {
    m: string;
    a: string;
}

const entries: DynamicEntries<State> = {
    m,
    a,
};

const store = new VersionedStore(entries, 'integer-modular-square-roots');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function squareRootsOfPrimePower(p: bigint, e: bigint, m: bigint, b: bigint): bigint[] {
    let xs: bigint[] = [];
    if (isEven(b)) {
        const b2 = halve(b);
        const d = max(halveRoundedUp(e), e - b2 - (isEven(p) ? one : zero));
        const pb2 = p ** b2;
        const pd = p ** d;
        const l = p ** (e - d);
        for (let c = zero; c < l; c++) {
            const value = pb2 + c * pd;
            xs.push(value % m, modulo(-value, m));
        }
        xs = sortIntegers(unique(xs));
    }
    return xs;
}

function generalizedTonelliShanks(p: bigint, e: bigint, m: bigint, _a: bigint): bigint | undefined {
    const phi = (p - one) * (p ** (e - one));
    const eulersExponent = halve(phi);
    const ring = new MultiplicativeRing(m);
    const a = ring.getElement(_a);
    if (!a.exponentiate(eulersExponent).isOne()) {
        return undefined;
    }

    let d = phi;
    let c = zero;
    while (isEven(d)) {
        d = halve(d);
        c++;
    }

    let x = a.exponentiate(halve(d + one));
    if (c >= two) {
        let b = ring.one.increment();
        while (b.exponentiate(eulersExponent).isOne()) {
            b = b.increment();
        }
        const aInv = a.invertMultiplicatively();
        b = b.exponentiate(d);
        for (let e = c - two; e >= 0; e--) {
            if (!x.square().multiply(aInv).exponentiate(two ** e).isOne()) {
                x = x.multiply(b);
            }
            b = b.square();
        }
    }
    return x.toInteger();
}

function squareRootsOfCoprimeElement(p: bigint, e: bigint, m: bigint, a: bigint): bigint[] {
    const xs: bigint[] = [];
    if (p !== two) { // p is odd
        const x = generalizedTonelliShanks(p, e, m, a);
        if (x !== undefined) {
            xs.push(x, m - x);
        }
    } else { // p is even
        if (e === one) {
            xs.push(one);
        } else if (e === two) {
            if (a % four === one) {
                xs.push(one, three);
            }
        } else if (a % eight === one) {
            let x = one;
            for (let i = three; i < e; i++) {
                if ((x * x - a) % (two ** (i + one)) !== zero) {
                    x += two ** (i - one);
                }
            }
            xs.push(x, two ** (e - one) - x, two ** (e - one) + x, two ** e - x);
        }
    }
    return sortIntegers(xs);
}

function bruteForce(m: bigint, a: bigint): JSX.Element {
    const xs: bigint[] = [];
    for (let i = zero; i < m; i++) {
        if (i * i % m === a) {
            xs.push(i);
        }
    }
    return <Fragment><br/>x ∈ {'{'}{join(xs.map(x => <Integer integer={x}/>))}{'}'}</Fragment>;
}

interface Subproblem {
    p: bigint;
    e: bigint;
    m: bigint;
    a: bigint;
    xs: bigint[];
}

function RawOutput(state: Readonly<State>): JSX.Element {
    const format = determineIntegerFormat(state.m);
    const _m = decodeInteger(state.m);
    const _a = decodeInteger(state.a) % _m;
    const factors = factorize(_m);
    if (factors === null) {
        return <p className="text-center">Could not factorize the modulus m.</p>;
    }

    const subproblems: Subproblem[] = [];
    for (const factor of factors) {
        const p = factor.base;
        const e = factor.exponent;
        const m = p ** e;
        const a = _a % m;
        let xs: bigint[] = [];
        if (a === zero) { // a = 0
            const d = halveRoundedUp(e);
            const pd = p ** d;
            const l = p ** (e - d);
            for (let c = zero; c < l; c++) {
                xs.push(c * pd);
            }
        } else {
            let c = a;
            let b = zero;
            while (c % p === zero) {
                c /= p;
                b++;
            }
            if (b > zero && c === one) { // a = p^b
                xs = squareRootsOfPrimePower(p, e, m, b);
            } else if (b === zero) {// gcd(a, p^e) = 0
                xs = squareRootsOfCoprimeElement(p, e, m, a);
            } else { // gcd(a, p^e) = p^b; a = p^b * c
                const x1s = squareRootsOfPrimePower(p, e, m, b);
                // const x2s = squareRootsOfCoprimeElement(p, e, m, c);
                const x2s = squareRootsOfCoprimeElement(p, e - b, p ** (e - b), c);
                xs = sortIntegers(unique(x1s.map(x1 => x2s.map(x2 => (x1 * x2) % m)).flat()));
            }
        }
        subproblems.push({ p, e, m, a, xs });
    }

    const solutions: bigint[] = sortIntegers(unique(subproblems.reduce((subproblem1, subproblem2) => ({
        p: zero,
        e: zero,
        m: subproblem1.m * subproblem2.m,
        a: zero,
        xs: subproblem1.xs.map(x1 => subproblem2.xs.map(x2 => chineseRemainder([subproblem1.m, x1], [subproblem2.m, x2])[1])).flat(),
    }), { p: one, e: one, m: one, a: zero, xs: [zero]}).xs));

    return <Fragment>
            <p className="text-center">m = <Integer integer={_m} format={format}/> {renderFactorsOrPrime(factors, format)}</p>
            <table>
                <thead>
                    <tr>
                        <th>p<Exponent exponent="e"/></th>
                        <th>Equation</th>
                        <th>Solutions</th>
                    </tr>
                </thead>
                <tbody>
                    {subproblems.map(subproblem => <tr>
                        <td className="text-nowrap"><Integer integer={subproblem.p} format={format}/><Exponent exponent={<Integer integer={subproblem.e} format={format}/>}/></td>
                        <td className="text-nowrap">x<Exponent exponent="2"/> =<sub><Integer integer={subproblem.m} format={format}/></sub> <Integer integer={subproblem.a} format={format}/></td>
                        <td>x ∈ {'{'}{join(subproblem.xs.map(x => <Integer integer={x} format={format}/>))}{'}'}{/*bruteForce(subproblem.m, subproblem.a)*/}</td>
                    </tr>)}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="text-nowrap text-right">Combined:</td>
                        <td className="text-nowrap">x<Exponent exponent="2"/> =<sub><Integer integer={_m} format={format}/></sub> <Integer integer={_a} format={format}/></td>
                        <td>x ∈ {'{'}{join(solutions.map(solution => <ClickToCopy><Integer integer={solution} format={format}/></ClickToCopy>))}{'}'}{/*bruteForce(_m, _a)*/}</td>
                    </tr>
                </tfoot>
            </table>
    </Fragment>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolIntegerModularSquareRoots: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
