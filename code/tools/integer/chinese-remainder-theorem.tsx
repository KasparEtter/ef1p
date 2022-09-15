/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { ClickToCopy } from '../../react/copy';
import { DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { AdditionSign, Integer, MultiplicationSign } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat } from '../../math/integer';
import { areCoprime, bezoutsIdentity, modulo, two } from '../../math/utility';

import { integerGreaterOne, nonNegativeInteger } from '../utility/integer';

/* ------------------------------ Input ------------------------------ */

const m1: DynamicTextEntry<State> = {
    ...integerGreaterOne,
    label: 'Modulus m1',
    defaultValue: '5',
    stayEnabled: true,
};

const m2: DynamicTextEntry<State> = {
    ...integerGreaterOne,
    label: 'Modulus m2',
    defaultValue: '7',
    dependencies: 'm1',
    validateDependently: (input, inputs) => decodeInteger(input) < two && 'The integer has to be at least 2.' ||
        !areCoprime(decodeInteger(input), decodeInteger(inputs.m1)) && 'The two moduli have to be coprime.',
};

const r1: DynamicTextEntry<State> = {
    ...nonNegativeInteger,
    label: 'Remainder r1',
    defaultValue: '3',
};

const r2: DynamicTextEntry<State> = {
    ...nonNegativeInteger,
    label: 'Remainder r2',
    defaultValue: '4',
};

interface State {
    m1: string;
    m2: string;
    r1: string;
    r2: string;
}

const entries: DynamicEntries<State> = {
    m1,
    m2,
    r1,
    r2,
};

const store = new VersionedStore(entries, 'integer-chinese-remainder-theorem');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function RawOutput(state: Readonly<State>): JSX.Element {
    const format = determineIntegerFormat(state.m1);
    const m1 = decodeInteger(state.m1);
    const m2 = decodeInteger(state.m2);
    const r1 = decodeInteger(state.r1);
    const r2 = decodeInteger(state.r2);
    const [c1, c2] = bezoutsIdentity(m1, m2);

    const modulus = m1 * m2;
    const solution = modulo(r1 * c2 * m2 + r2 * c1 * m1, modulus);
    return <table className="align">
        <tr>
            <th>Problem:</th>
            <td>x</td>
            <td>=<sub>m<sub>1</sub></sub> r<sub>1</sub> =<sub><Integer integer={m1} format={format}/></sub> <Integer integer={r1} format={format}/></td>
        </tr>
        <tr>
            <th></th>
            <td>x</td>
            <td>=<sub>m<sub>2</sub></sub> r<sub>2</sub> =<sub><Integer integer={m2} format={format}/></sub> <Integer integer={r2} format={format}/></td>
        </tr>
        <tr className="padding-top">
            <th>Bézout's identity:</th>
            <td>1</td>
            <td>
                = N<sub>1</sub><MultiplicationSign/>m<sub>2</sub><AdditionSign/>N<sub>2</sub><MultiplicationSign/>m<sub>1</sub><br/>
                = <Integer integer={c2} format={format} parenthesesIfNegative/><MultiplicationSign/><Integer integer={m2} format={format}/><AdditionSign/>
                <Integer integer={c1} format={format} parenthesesIfNegative/><MultiplicationSign/><Integer integer={m1} format={format}/>
            </td>
        </tr>
        <tr className="padding-top click-to-copy-padding-bottom">
            <th>Solution:</th>
            <td>x</td>
            <td>
                =<sub>m<sub>1</sub><MultiplicationSign/>m<sub>2</sub></sub> r<sub>1</sub><MultiplicationSign/>N<sub>1</sub><MultiplicationSign/>m<sub>2</sub><AdditionSign/>r<sub>2</sub><MultiplicationSign/>N<sub>2</sub><MultiplicationSign/>m<sub>1</sub><br/>
                =<sub><Integer integer={modulus} format={format}/></sub>{' '}
                <Integer integer={r1} format={format}/><MultiplicationSign/><Integer integer={c2} format={format} parenthesesIfNegative/><MultiplicationSign/><Integer integer={m2} format={format}/><AdditionSign/>
                <Integer integer={r2} format={format}/><MultiplicationSign/><Integer integer={c1} format={format} parenthesesIfNegative/><MultiplicationSign/><Integer integer={m1} format={format}/><br/>
                =<sub><Integer integer={modulus} format={format}/></sub> <ClickToCopy><Integer integer={solution} format={format}/></ClickToCopy>
            </td>
        </tr>
    </table>;
}

const Output = store.injectCurrentState<{}>(RawOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolIntegerChineseRemainderTheorem: Tool = [
    <Fragment>
        <Input inColumns individualLabelWidth/>
        <Output/>
    </Fragment>,
    store,
];
