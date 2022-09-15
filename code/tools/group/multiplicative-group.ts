/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { encodePercent } from '../../utility/string';

import { DynamicEntries } from '../../react/entry';
import { VersionedStore } from '../../react/versioned-store';

import { encodeInteger } from '../../math/formatting';
import { decodeInteger, determineIntegerFormat, ToInteger } from '../../math/integer';
import { MultiplicativeGroup, MultiplicativeGroupElement } from '../../math/multiplicative-group';

import { A, m, MultiplicativeGroupState } from '../utility/multiplicative-group';

import { getElementOrderTool, getGeneratorSearchTool } from './utility';

/* ------------------------------ Element order ------------------------------ */

interface ElementOrderState extends MultiplicativeGroupState {
    A: string;
}

const elementOrderEntries: DynamicEntries<ElementOrderState> = {
    m,
    A,
};

const elementOrderStore = new VersionedStore(elementOrderEntries, 'group-multiplicative-group-element-order');

export const toolGroupMultiplicativeGroupElementOrder = getElementOrderTool(
    elementOrderStore,
    state => new MultiplicativeGroup(decodeInteger(state.m)).getElementFromString(state.A),
    state => determineIntegerFormat(state.m),
);

/* ------------------------------ Generator search ------------------------------ */

type GeneratorSearchState = MultiplicativeGroupState;

const generatorSearchEntries: DynamicEntries<GeneratorSearchState> = {
    m,
};

const generatorSearchStore = new VersionedStore(generatorSearchEntries, 'group-multiplicative-group-generator-search');

export const toolGroupMultiplicativeGroupGeneratorSearch = getGeneratorSearchTool<GeneratorSearchState, MultiplicativeGroup, MultiplicativeGroupElement>(
    generatorSearchStore,
    state => new MultiplicativeGroup(decodeInteger(state.m)),
    state => determineIntegerFormat(state.m),
    (G, format) => {
        function e(integer: number | bigint | ToInteger): string {
            return encodePercent(encodeInteger(integer, format));
        }
        return `#tool-group-multiplicative-group-element-order&m=${e(G.group.modulus)}&A=${e(G)}`;
    },
);
