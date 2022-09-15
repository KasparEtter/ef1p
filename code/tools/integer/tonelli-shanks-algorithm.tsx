/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { ClickToCopy } from '../../react/copy';
import { DetermineButton, DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { AdditionSign, DivisionSign, Exponent, Integer, MinusSign, MultiplicationSign } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat } from '../../math/integer';
import { MultiplicativeRing } from '../../math/multiplicative-ring';
import { halve, isEven, minusOne, one, two, zero } from '../../math/utility';

import { p as _p } from '../utility/elliptic-curve';
import { integerInputWidth, nonNegativeInteger } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

/**
 * Odd prime modulus of arbitrary length.
 */
const p: DynamicTextEntry<State> = {
    ..._p,
    tooltip: 'An odd prime number of arbitrary length.',
    defaultValue: '97',
    inputWidth: integerInputWidth / 4,
};

const determineNextResidue: DetermineButton<string, State> = {
    label: 'Next residue',
    tooltip: 'Determines the next quadratic residue modulo p.',
    requireIndependentlyValidInput: true,
    onClick: async (input, inputs) => MultiplicativeRing.fromPrime(decodeInteger(inputs.p)).getElementFromString(input).getNextQuadraticResidue().to(determineIntegerFormat(input)),
}

const determinePreviousResidue: DetermineButton<string, State> = {
    label: 'Previous residue',
    tooltip: 'Determines the previous quadratic residue modulo p.',
    requireIndependentlyValidInput: true,
    onClick: async (input, inputs) => MultiplicativeRing.fromPrime(decodeInteger(inputs.p)).getElementFromString(input).getPreviousQuadraticResidue().to(determineIntegerFormat(input)),
}

const a: DynamicTextEntry<State> = {
    ...nonNegativeInteger,
    label: 'Input a',
    tooltip: 'A quadratic residue modulo p of arbitrary length.',
    defaultValue: '11',
    inputWidth: integerInputWidth / 4,
    dependencies: ['p'],
    validateDependently: (input, inputs) => !MultiplicativeRing.fromPrime(decodeInteger(inputs.p)).getElementFromString(input).isQuadraticResidue() && 'This input is not a quadratic residue.',
    onUpOrDown: (event, input, inputs) => MultiplicativeRing.fromPrime(decodeInteger(inputs.p)).getElementFromString(input).getNextOrPreviousQuadraticResidue(event === 'up').to(determineIntegerFormat(input)),
    determine: [determineNextResidue, determinePreviousResidue],
};

interface State {
    p: string;
    a: string;
}

const entries: DynamicEntries<State> = {
    p,
    a,
};

const store = new VersionedStore(entries, 'integer-tonelli-shanks-algorithm');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const format = determineIntegerFormat(state.p);
    const p = decodeInteger(state.p);
    const field = MultiplicativeRing.fromPrime(p);
    const a = field.getElementFromString(state.a);

    const sections = new Array<ReactNode>();
    const abstractEquality = <sub>p</sub>;
    const concreteEquality = <sub><Integer integer={p} format={format}/></sub>;

    let d = p - one;
    let c = zero;
    while (isEven(d)) {
        d = halve(d);
        c++;
    }

    sections.push(<table className="align">
        <tr><td className="text-right">p<MinusSign/>1</td><td>=</td><td>2<Exponent exponent="c"/><MultiplicationSign/>d</td></tr>
        <tr><td className="text-right"><Integer integer={p} format={format}/><MinusSign/>1</td><td>=</td><td>2<Exponent exponent={<Integer integer={c} format={format}/>}/><MultiplicationSign/><Integer integer={d} format={format}/></td></tr>
    </table>);

    let x = a.exponentiate(halve(d + one));
    sections.push(<p className="text-center">
        {c >= two && <Fragment>Initial{' '}</Fragment>}
        x ={abstractEquality} a<Exponent exponent={<Fragment>(d<AdditionSign/>1)<DivisionSign/>2</Fragment>} parenthesesIfNotRaised/>
        ={abstractEquality} <Integer integer={a} format={format}/><Exponent exponent={<Fragment>(<Integer integer={d} format={format}/><AdditionSign/>1)<DivisionSign/>2</Fragment>} parenthesesIfNotRaised/>
        ={concreteEquality} <Integer integer={x} format={format}/>
    </p>);

    if (c >= two) {
        const nonResidueRows = new Array<ReactNode>();

        let b = field.one;
        const eulersExponent = halve(p - one);
        for (let value = two; value < p; value++) {
            const element = field.getElement(value);
            const eulersCriterion = element.exponentiate(eulersExponent).toIntegerAroundZero();
            nonResidueRows.push(<tr>
                <td><Integer integer={element} format={format} color={eulersCriterion === minusOne ? 'green' : 'red'}/></td>
                <td><Integer integer={eulersCriterion}/></td>
            </tr>);
            if (eulersCriterion === minusOne) {
                b = element;
                break;
            }
        }

        sections.push(<table className="text-right text-break">
            <thead>
                <tr className="text-left text-nowrap">
                    <th>Potential non-residue b</th>
                    <th>Euler's criterion b<Exponent exponent={<Fragment>(p<MinusSign/>1)<DivisionSign/>2</Fragment>} parenthesesIfNotRaised/></th>
                </tr>
            </thead>
            <tbody>
                {nonResidueRows}
            </tbody>
        </table>);

        const squareRootRows = new Array<ReactNode>();

        const aInv = a.invertMultiplicatively();
        b = b.exponentiate(d);
        for (let e = c - two; e >= 0; e--) {
            const check = x.square().multiply(aInv).exponentiate(two ** e).toIntegerAroundZero();
            squareRootRows.push(<tr>
                <td><Integer integer={e}/></td>
                <td><Integer integer={x} format={format}/></td>
                <td><Integer integer={check} color={check === one ? 'green' : 'red'}/></td>
                <td><Integer integer={b} format={format} color={check === one ? 'gray' : 'green'}/></td>
            </tr>);
            if (check === minusOne) {
                x = x.multiply(b);
            }
            b = b.square();
        }

        sections.push(<table className="text-right text-break">
            <thead>
                <tr className="text-left text-nowrap">
                    <th>e</th>
                    <th>x</th>
                    <th>(x<Exponent exponent="2"/><MultiplicationSign/>a<Exponent exponent={<Fragment><MinusSign noSpaces/>1</Fragment>} parenthesesIfNotRaised/>)<Exponent exponent={<Fragment>(2<Exponent exponent="e"/>)</Fragment>}/></th>
                    <th>(b<Exponent exponent="d"/>)<Exponent exponent={<Fragment>(2<Exponent exponent={<Fragment>c<MinusSign/>e<MinusSign/>2</Fragment>} parenthesesIfNotRaised/>)</Fragment>}/></th>
                </tr>
            </thead>
            <tbody>
                {squareRootRows}
            </tbody>
        </table>);
    }

    sections.push(<p className="text-center">
        x ={abstractEquality} ±<ClickToCopy><Integer integer={x} format={format}/></ClickToCopy>
        ={concreteEquality} ±<ClickToCopy><Integer integer={x.invertAdditively()} format={format}/></ClickToCopy>
    </p>);

    sections.push(<p className="text-center">
        x<Exponent exponent="2"/> ={abstractEquality} <Integer integer={x.square()} format={format}/>
    </p>);

    return <Fragment>{sections}</Fragment>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolIntegerTonelliShanksAlgorithm: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
