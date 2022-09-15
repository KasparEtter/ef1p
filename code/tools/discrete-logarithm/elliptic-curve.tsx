/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { encodePercent } from '../../utility/string';

import { DetermineButton, DynamicEntries, DynamicTextEntry } from '../../react/entry';
import { getOutputEntries } from '../../react/output-entries';
import { VersionedStore } from '../../react/versioned-store';

import { EllipticCurve, EllipticCurveElement } from '../../math/elliptic-curve';
import { encodeInteger } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat, ToInteger } from '../../math/integer';
import { getRandomInteger, isEven, one } from '../../math/utility';

import { delay } from '../utility/animation';
import { A, a, b, EllipticCurveStateWithGenerator, getGenerator, Gx, Gy, n, p } from '../utility/elliptic-curve';
import { integerInputWidth } from '../utility/integer';

import { DiscreteLogarithms, DiscreteLogarithmState, k } from './utility';

const generateRandomK: DetermineButton<string, State> = {
    label: 'Random',
    tooltip: 'Generates a random output of the linear one-way function.',
    requireValidDependencies: true,
    onClick: async (_, inputs) => getGenerator(inputs).repeat(getRandomInteger(one, decodeInteger(inputs.n))).to(determineIntegerFormat(inputs.p)),
}

const K: DynamicTextEntry<State> = {
    ...A,
    label: 'Output K',
    defaultValue: '(31, 85)',
    inputWidth: integerInputWidth - 72,
    dependencies: ['p', 'a', 'b', 'Gx', 'Gy', 'k'],
    derive: inputs => getGenerator(inputs).repeat(decodeInteger(inputs.k)).to(determineIntegerFormat(inputs.p)),
    determine: generateRandomK,
};

interface State extends DiscreteLogarithmState, EllipticCurveStateWithGenerator {}

const entries: DynamicEntries<State> = {
    p: { ...p, defaultValue: '97' },
    a: { ...a, defaultValue: '1' },
    b: { ...b, defaultValue: '4' },
    Gx: { ...Gx, defaultValue: '56' },
    Gy,
    n: { ...n, defaultValue: '89' },
    k,
    K,
    d: delay,
};

const store = new VersionedStore(entries, 'discrete-logarithm-elliptic-curve');

export const toolDiscreteLogarithmEllipticCurve = new DiscreteLogarithms<State, EllipticCurve, EllipticCurveElement>(
    store,
    getGenerator,
    'elliptic-curve',
    (G, n, format) => {
        function e(integer: number | bigint | ToInteger): string {
            return encodePercent(encodeInteger(integer, format));
        }
        return `&p=${e(G.group.field.modulus)}&a=${e(G.group.a)}&b=${e(G.group.b)}&Gx=${e(G.x)}&Gy=${isEven(G.y.toInteger())}&n=${e(n)}`;
    },
);

const OutputEntries = getOutputEntries(store);
export const dlpEllipticCurveP = <OutputEntries entries={{ p }}/>;
export const dlpEllipticCurveA = <OutputEntries entries={{ a }}/>;
export const dlpEllipticCurveB = <OutputEntries entries={{ b }}/>;
export const dlpEllipticCurveGx = <OutputEntries entries={{ Gx }}/>;
