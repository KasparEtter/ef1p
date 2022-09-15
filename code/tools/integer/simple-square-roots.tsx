/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { ClickToCopy } from '../../react/copy';
import { DetermineButton, DynamicEntries, DynamicTextEntry, InputError } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { AdditionSign, DivisionSign, encodeInteger, Exponent, Integer, MinusSign } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat } from '../../math/integer';
import { MultiplicativeRing } from '../../math/multiplicative-ring';
import { isProbablePrime } from '../../math/prime';
import { four, minusOne, modulo, one, three, two, zero } from '../../math/utility';

import { integer, primeInteger } from '../utility/integer';
import { getWarningSymbol } from '../utility/warning';

/* ------------------------------ Input ------------------------------ */

// There are no dependencies, but the following restrictions shall
// not disable 'onUpOrDown' and the determine buttons.
function validateModulusDependently(modulus: string): InputError {
    const integer = decodeInteger(modulus);
    if (!isProbablePrime(integer)) {
        return 'This integer is not prime.';
    } else if ((integer + one) % four !== zero) {
        return 'The modulus plus 1 has to be a multiple of 4.';
    } else {
        return false;
    }
}

function getNextPrimeSupportingSquareRoots(input: string): bigint {
    let integer = decodeInteger(input);
    if (integer < three) {
        return three;
    }
    integer = integer - ((integer + one) % four) + four;
    while (!isProbablePrime(integer)) {
        integer += four;
    }
    return integer;
}

function getPreviousPrimeSupportingSquareRoots(input: string): bigint {
    let integer = decodeInteger(input);
    if (integer <= three) {
        return three;
    }
    integer = integer + modulo(-integer - one, four) - four;
    while (!isProbablePrime(integer)) {
        integer -= four;
    }
    return integer;
}

const determineNextPrimeSupportingSquareRoots: DetermineButton<string> = {
    label: 'Next prime',
    tooltip: 'Determines the next higher prime number which supports simple square roots.',
    requireIndependentlyValidInput: true,
    onClick: async input => encodeInteger(getNextPrimeSupportingSquareRoots(input), determineIntegerFormat(input)),
}

const determinePreviousPrimeSupportingSquareRoots: DetermineButton<string> = {
    label: 'Previous prime',
    tooltip: 'Determines the next lower prime number which supports simple square roots.',
    requireIndependentlyValidInput: true,
    onClick: async input => encodeInteger(getPreviousPrimeSupportingSquareRoots(input), determineIntegerFormat(input)),
    disable: input => decodeInteger(input) <= three,
}

/**
 * Prime modulus of arbitrary length, where the modulus plus one has to be a multiple of four.
 */
export const p: DynamicTextEntry = {
    ...primeInteger,
    label: 'Modulus p',
    tooltip: 'The modulus of the prime field which supports simple square roots.',
    defaultValue: '11',
    validateDependently: validateModulusDependently,
    onUpOrDown: (event, input) => encodeInteger(event === 'up' ? getNextPrimeSupportingSquareRoots(input) : getPreviousPrimeSupportingSquareRoots(input), determineIntegerFormat(input)),
    determine: [determineNextPrimeSupportingSquareRoots, determinePreviousPrimeSupportingSquareRoots],
};

const a: DynamicTextEntry = {
    ...integer,
    label: 'Input a',
    defaultValue: '5',
};

interface State {
    p: string;
    a: string;
}

const entries: DynamicEntries<State> = {
    p,
    a,
};

const store = new VersionedStore(entries, 'integer-simple-square-roots');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

const warningSymbol = getWarningSymbol('A square root does not exist.');

function RawOutput(state: Readonly<State>): JSX.Element {
    const format = determineIntegerFormat(state.p);
    const modulus = decodeInteger(state.p);
    const field = MultiplicativeRing.fromPrime(modulus);
    const input = field.getElementFromString(state.a);
    const output = input.exponentiate((modulus + one) / four);
    const eulersCriterion = input.exponentiate((modulus - one) / two).toIntegerAroundZero();
    const abstractEquality = <sub>p</sub>;
    const concreteEquality = <sub><Integer integer={modulus} format={format}/></sub>;
    return <table className="list">
        <tr>
            <th>Euler's criterion:</th>
            <td>
                a<Exponent exponent={<Fragment>(p<MinusSign/>1)<DivisionSign/>2</Fragment>} parenthesesIfNotRaised/>
                ={abstractEquality} <Integer integer={input} format={format}/><Exponent exponent={<Fragment>(<Integer integer={modulus} format={format}/><MinusSign/>1)<DivisionSign/>2</Fragment>} parenthesesIfNotRaised/>
                ={concreteEquality} <Integer integer={eulersCriterion}/>
            </td>
        </tr>
        <tr>
            <th>Square root of a:</th>
            {eulersCriterion === minusOne ?
                <td>{warningSymbol}</td> :
                <td>
                    a<Exponent exponent={<Fragment>(p<AdditionSign/>1)<DivisionSign/>4</Fragment>} parenthesesIfNotRaised/>
                    ={abstractEquality} <Integer integer={input} format={format}/><Exponent exponent={<Fragment>(<Integer integer={modulus} format={format}/><AdditionSign/>1)<DivisionSign/>4</Fragment>} parenthesesIfNotRaised/>
                    ={concreteEquality} {output.isZero() ? '0' : <Fragment>±<ClickToCopy><Integer integer={output} format={format}/></ClickToCopy> ={concreteEquality} ±<ClickToCopy><Integer integer={output.invertAdditively()} format={format}/></ClickToCopy></Fragment>}
                </td>
            }
        </tr>
    </table>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolIntegerSimpleSquareRoots: Tool = [
    <Fragment>
        <Input/>
        <Output/>
    </Fragment>,
    store,
];
