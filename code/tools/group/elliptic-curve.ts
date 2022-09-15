/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { encodePercent } from '../../utility/string';

import { DynamicEntries } from '../../react/entry';
import { VersionedStore } from '../../react/versioned-store';

import { EllipticCurve, EllipticCurveElement } from '../../math/elliptic-curve';
import { encodeInteger } from '../../math/formatting';
import { determineIntegerFormat, ToInteger } from '../../math/integer';
import { isEven } from '../../math/utility';

import { a, Ax, Ay, b, EllipticCurveState, getEllipticCurve, p } from '../utility/elliptic-curve';

import { getElementOrderTool, getGeneratorSearchTool } from './utility';

/* ------------------------------ Element order ------------------------------ */

interface ElementOrderState extends EllipticCurveState {
    Ax: string;
    Ay: boolean;
}

const elementOrderEntries: DynamicEntries<ElementOrderState> = {
    p: { ...p, defaultValue: '97' },
    a: { ...a, defaultValue: '−1' },
    b: { ...b, defaultValue: '4' },
    Ax: { ...Ax, defaultValue: '33'},
    Ay,
};

const elementOrderStore = new VersionedStore(elementOrderEntries, 'group-elliptic-curve-element-order');

export const toolGroupEllipticCurveElementOrder = getElementOrderTool(
    elementOrderStore,
    state => getEllipticCurve(state).getElementFromStringX(state.Ax, state.Ay)!,
    state => determineIntegerFormat(state.p),
    true,
);

/* ------------------------------ Generator search ------------------------------ */

type GeneratorSearchState = EllipticCurveState;

const generatorSearchEntries: DynamicEntries<GeneratorSearchState> = {
    p: { ...p, defaultValue: '97' },
    a: { ...a, defaultValue: '−1' },
    b: { ...b, defaultValue: '4' },
};

const generatorSearchStore = new VersionedStore(generatorSearchEntries, 'group-elliptic-curve-generator-search');

export const toolGroupEllipticCurveGeneratorSearch = getGeneratorSearchTool<GeneratorSearchState, EllipticCurve, EllipticCurveElement>(
    generatorSearchStore,
    state => getEllipticCurve(state),
    state => determineIntegerFormat(state.p),
    (G, format) => {
        function e(integer: number | bigint | ToInteger): string {
            return encodePercent(encodeInteger(integer, format));
        }
        return `#tool-group-elliptic-curve-element-order&p=${e(G.group.field.modulus)}&a=${e(G.group.a)}&b=${e(G.group.b)}&Ax=${e(G.x)}&Ay=${isEven(G.y.toInteger())}`;
    },
    true,
);
