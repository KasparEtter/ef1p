/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { ClickToCopy } from '../../react/copy';
import { BasicState } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

import { Factor, factorize } from '../../math/factorization';
import { DivisionSign, Exponent, Integer } from '../../math/formatting';
import { Group, GroupElement } from '../../math/group';
import { IntegerFormat } from '../../math/integer';
import { MultiplicativeGroup } from '../../math/multiplicative-group';

import { renderFactorization, renderFactors, renderFactorsOrPrime } from '../utility/factors';

/* ------------------------------ Element order ------------------------------ */

export function getElementOrderTool<State extends BasicState<State>, G extends Group<G, E>, E extends GroupElement<G, E>> (
    store: VersionedStore<State>,
    getElement: (state: State) => E,
    getFormat: (state: State) => IntegerFormat,
    inColumns = false,
): Tool {
    function RawOutput(state: Readonly<State>): JSX.Element {
        const format = getFormat(state);
        const A = getElement(state);
        const group = A.group;
        const n = group.getRepetitionOrder();
        const factors = group.getRepetitionOrderFactors();
        if (n === null) {
            return <p className="text-center">Could not determine the order of the group.</p>;
        }
        if (factors === null) {
            return <p className="text-center">Could not factorize the order of the group.</p>;
        }

        const rows = new Array<ReactNode>();
        function addRow(d: bigint, B: E, factor?: Factor) {
            rows.push(<tr className={factor ? 'thick-border-top' : undefined}>
                <th>{factor && <Fragment><Integer integer={factor.base} format={format}/><Exponent exponent={<Integer integer={factor.exponent} format={format}/>}/></Fragment>}</th>
                <td className="pr-0"><Integer integer={d} format={format}/></td>
                <td className="pl-0 text-left color-gray">&nbsp;= {renderFactors(factorize(d) ?? [])}</td>
                <td>{B.render(format, B.isIdentity() ? 'green' : 'red')}</td>
            </tr>);
        }

        let d = n;
        for (const factor of factors) {
            d = d / (factor.base ** factor.exponent);
            let B = A.repeat(d);
            addRow(d, B, factor);
            while (!B.isIdentity()) {
                B = B.repeat(factor.base);
                d = d * factor.base;
                addRow(d, B);
            }
        }

        return <Fragment>
            <p className="text-center">Group order n = <Integer integer={n} format={format}/> {renderFactorsOrPrime(factors, format)}</p>
            <table className="table-with-vertical-border-after-column-1 text-right text-nowrap">
                <thead>
                    <tr>
                        <th>p<sub>i</sub><Exponent exponent={<Fragment>e<sub>i</sub></Fragment>}/></th>
                        <th className="pr-0">d</th>
                        <th></th>
                        <th>B {group.renderAbstractEquality('m')} {group.renderRepetition('A', 'd')}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <p className="text-center">Element order d = <ClickToCopy><Integer integer={d} format={format}/></ClickToCopy></p>
        </Fragment>;
    }

    const Input = getInput(store);
    const Output = store.injectCurrentState<{}>(RawOutput);

    return [
        <Fragment>
            <Input inColumns={inColumns}/>
            <Output/>
        </Fragment>,
        store,
    ];
}

/* ------------------------------ Generator search ------------------------------ */

export function getGeneratorSearchTool<State extends BasicState<State>, G extends Group<G, E>, E extends GroupElement<G, E>> (
    store: VersionedStore<State>,
    getGroup: (state: State) => G,
    getFormat: (state: State) => IntegerFormat,
    getLink: (G: E, format: IntegerFormat) => string,
    inColumns = false,
): Tool {
    function RawOutput(state: Readonly<State>): JSX.Element {
        const format = getFormat(state);
        const group = getGroup(state);
        const n = group.getRepetitionOrder();
        const factors = group.getRepetitionOrderFactors();
        if (n === null) {
            return <p className="text-center">Could not determine the order of the group.</p>;
        }
        if (factors === null) {
            return <p className="text-center">Could not factorize the order of the group.</p>;
        }
        if (group instanceof MultiplicativeGroup && !group.isCyclic()!) {
            return <Fragment>
                <p className="text-center">{renderFactorization(group.modulus, format)}</p>
                <p className="text-center">The multiplicative group {group.render(format)} is not cyclic.</p>
            </Fragment>;
        }

        const rows = new Array<ReactNode>();
        function addRow(A: E, B: E, factor?: Factor, Gi?: E) {
            rows.push(<tr className={factor ? 'thick-border-top' : undefined}>
                <th>{factor && <Fragment><Integer integer={factor.base} format={format}/><Exponent exponent={<Integer integer={factor.exponent} format={format}/>}/></Fragment>}</th>
                <td>{A.render(format)}</td>
                <td>{B.render(format, B.isIdentity() ? 'red' : 'green')}</td>
                <td>{Gi && Gi.render(format)}</td>
            </tr>);
        }

        let G = group.identity;
        outer: for (const factor of factors) {
            const repetitions = n / factor.base;
            for (let i = 0; i < 128; i++) {
                const A = group.getRandomElement();
                const B = A.repeat(repetitions);
                if (!B.isIdentity()) {
                    const Gi = A.repeat(n / (factor.base ** factor.exponent));
                    G = G.combine(Gi);
                    addRow(A, B, i === 0 ? factor : undefined, Gi);
                    continue outer;
                }
                addRow(A, B, i === 0 ? factor : undefined);
            }
            return <p className="text-center">The elliptic curve {group.render(format)} is almost certainly not cyclic.</p>;
        }

        return <Fragment>
            {group instanceof MultiplicativeGroup && <p className="text-center">{renderFactorization(group.modulus, format)}</p>}
            <p className="text-center">Group order n = <Integer integer={n} format={format}/> {renderFactorsOrPrime(factors, format)}</p>
            <table className="table-with-vertical-border-after-column-1 text-right text-nowrap">
                <thead>
                    <tr>
                        <th>p<sub>i</sub><Exponent exponent={<Fragment>e<sub>i</sub></Fragment>}/></th>
                        <th>Random A</th>
                        <th>B {group.renderAbstractEquality('m')} {group.renderRepetition('A', <Fragment>n<DivisionSign/>p<sub>i</sub></Fragment>, true)}</th>
                        <th>G<sub>i</sub> {group.renderAbstractEquality('m')} {group.renderRepetition('A', <Fragment>n<DivisionSign/>p<sub>i</sub><Exponent exponent={<Fragment>e<sub>i</sub></Fragment>}/></Fragment>, true)}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <p className="text-center">
                Generator G {group.renderAbstractEquality('m')} <ClickToCopy>{G.render(format)}</ClickToCopy>{' '}
                <a href={getLink(G, format)} title="Use the previous tool to verify the order.">↗</a>
            </p>
        </Fragment>;
    }

    const Input = getInput(store);
    const Output = store.injectCurrentState<{}>(RawOutput);

    return [
        <Fragment>
            <Input
                submit={{
                    label: 'Search',
                    tooltip: 'Search for a generator of the given group.',
                    onClick: () => { store.updateComponents('state') },
                }}
                inColumns={inColumns}
            />
            <Output/>
        </Fragment>,
        store,
    ];
}
