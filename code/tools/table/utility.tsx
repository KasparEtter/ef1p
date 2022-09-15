/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { Color, getBackgroundColorClass } from '../../utility/color';
import { Equality } from '../../utility/object';
import { ObjectButNotFunction } from '../../utility/types';

import { ClickToCopy } from '../../react/copy';
import { DetermineButton, DynamicBooleanEntry, DynamicNumberEntry } from '../../react/entry';
import { join } from '../../react/utility';

import { factorize, phi } from '../../math/factorization';
import { Integer, ModuloSign } from '../../math/formatting';
import { ModularElement } from '../../math/modular-element';
import { ModularGroupElement } from '../../math/modular-group';
import { getNextPrime, getPreviousPrime } from '../../math/prime';

import { renderFactors } from '../utility/factors';

/* ------------------------------ Input ------------------------------ */

export const modulusInputWidth = 50;

export function getNextPrimeNumber(input: number): number {
    return Number(getNextPrime(BigInt(input)));
}

export function getPreviousPrimeNumber(modulus: number): number {
    return Number(getPreviousPrime(BigInt(modulus)));
}

export const determineNextPrimeNumberBelow100: DetermineButton<number> = {
    label: 'Next prime',
    tooltip: 'Determines the next higher prime number below 100.',
    onClick: async input => getNextPrimeNumber(input),
    disable: modulus => modulus >= 97,
}

export const determinePreviousPrimeNumberBelow100: DetermineButton<number> = {
    label: 'Previous prime',
    tooltip: 'Determines the next lower prime number below 100.',
    onClick: async input => Math.min(getPreviousPrimeNumber(input), 97),
    disable: modulus => modulus <= 2,
}

/**
 * Number modulus between 2 and 100, which does not have to be prime.
 */
export const modulus: DynamicNumberEntry = {
    label: 'Modulus',
    tooltip: 'The modulus of the group.',
    defaultValue: 11,
    inputType: 'number',
    inputWidth: modulusInputWidth,
    stayEnabled: true,
    minValue: 2,
    maxValue: 100,
    determine: [determineNextPrimeNumberBelow100, determinePreviousPrimeNumberBelow100],
};

export const coprime: DynamicBooleanEntry = {
    label: 'Coprime',
    tooltip: 'Whether to restrict the elements to the ones which are coprime with the modulus or zero.',
    defaultValue: false,
    inputType: 'switch',
};

export const composite: DynamicBooleanEntry = {
    label: 'Composite',
    tooltip: 'Whether to output each element modulo each prime factor of the modulus.',
    defaultValue: false,
    inputType: 'switch',
};

export const repeat: DynamicBooleanEntry = {
    label: 'Repeat',
    tooltip: 'Whether to repeat the sequence once the identity element has been reached.',
    defaultValue: false,
    inputType: 'switch',
};

export const order: DynamicBooleanEntry = {
    label: 'Order',
    tooltip: 'Whether to display the order of each element as subscripts.',
    defaultValue: false,
    inputType: 'switch',
};

export const totient: DynamicBooleanEntry = {
    label: 'Totient',
    tooltip: "Whether to display the result of Euler's totient function for each number which divides the group order.",
    defaultValue: false,
    inputType: 'switch',
};

/* ------------------------------ Colors ------------------------------ */

export const zeroColor = 'blue';
export const oneColor = 'green';
export const rootColor = 'gray';
export const nonCoprimeColor = 'red';

export function headColor(element: ModularElement): Color | undefined {
    return element.isCoprimeWithModulus() ? oneColor: zeroColor;
}

export function cellColor(element: ModularElement): Color | undefined {
    if (element.isZero()) {
        return zeroColor;
    } else if (element.isOne()) {
        return oneColor;
    } else {
        return undefined;
    }
}

export function coprimeCellColor(element: ModularElement): Color | undefined {
    return (element.isCoprimeWithModulus() || element.isZero()) ? cellColor(element) : nonCoprimeColor;
}

/* ------------------------------ Output ------------------------------ */

export function renderCompositeModuli(modulus: bigint): ReactNode {
    const factors = factorize(modulus);
    if (factors === null) {
        return <p className="table-title">Could not factorize <Integer integer={modulus}/></p>;
    } else {
        return <p className="table-title">
            <ModuloSign noSpaces/> <Integer integer={modulus}/> {'['}= {renderFactors(factors)}{'] '}
            ↔ ({join(factors.map(factor => <Fragment><ModuloSign noSpaces/> <Integer integer={factor.base ** factor.exponent}/></Fragment>))})
        </p>;
    }
}

export function compositeOutput(modulus: bigint): (element: ModularGroupElement<any, any>) => ReactNode {
    const moduli = factorize(modulus)!.map(factor => factor.base ** factor.exponent);
    return (element: ModularGroupElement<any, any>) => `${element.toString()} ↔ (${moduli.map(modulus => (element.value % modulus).toString()).join(', ')})`;
}

/* ------------------------------ Properties ------------------------------ */

interface TableProps<E extends ObjectButNotFunction> {
    elements: E[];
    operation: (element1: E, element2: E) => E;
    elementOutput?: ((element: E) => ReactNode) | undefined;
    cellColor: (element: E) => Color | undefined;
    tableClass: string;
}

/* ------------------------------ Operation table ------------------------------ */

export interface OperationTableProps<E extends ObjectButNotFunction> extends TableProps<E> {
    symbol: ReactNode;
    headColor?: (element: E) => Color | undefined;
}

export function OperationTable<E extends ObjectButNotFunction>({
    symbol,
    elements,
    operation,
    elementOutput = (element: E) => element.toString(),
    headColor = _ => undefined,
    cellColor,
    tableClass,
}: OperationTableProps<E>): JSX.Element {
    // if (elements.length > 100) {
    //     return <p className="text-center">{elements.length} are too many elements to display.</p>;
    // }
    return <table className={'table-with-borders table-with-vertical-border-after-column-1 highlight-hovered-row-and-column text-nowrap ' + tableClass}>
        <thead>
            <tr>
                <th>{symbol}</th>
                {elements.map(b => <th className={getBackgroundColorClass(headColor(b))}><ClickToCopy>{elementOutput(b)}</ClickToCopy></th>)}
            </tr>
        </thead>
        <tbody>
            {elements.map(a => <tr>
                <td className={'font-weight-bold' + getBackgroundColorClass(headColor(a), ' ')}><ClickToCopy>{elementOutput(a)}</ClickToCopy></td>
                {elements.map(b => operation(a, b)).map(element =>
                    <td className={getBackgroundColorClass(cellColor(element))}><ClickToCopy>{elementOutput(element)}</ClickToCopy></td>,
                )}
            </tr>)}
        </tbody>
    </table>;
}

/* ------------------------------ Repetition table ------------------------------ */

export interface RepetitionTableProps<E extends Equality<E>> extends TableProps<E> {
    groupOrder: number;
    elementOrder: (element: E) => bigint;
    indexOutput: (index: number) => ReactNode;
    indexColor: (index: number) => Color | undefined;
    identity: E;
    repeat: boolean;
    order: boolean;
    totient: boolean;
}

export function RepetitionTable<E extends Equality<E>>({
    elements,
    operation,
    elementOutput = (element: E) => element.toString(),
    cellColor,
    tableClass,
    groupOrder,
    elementOrder,
    indexOutput,
    indexColor,
    identity,
    repeat,
    order,
    totient,
}: RepetitionTableProps<E>): JSX.Element {
    // if (elements.length * groupOrder > 10000) {
    //     return <p className="text-center">{elements.length} elements with {groupOrder} columns cannot be displayed.</p>;
    // }
    return <table className={'table-with-borders table-with-vertical-border-after-column-1 highlight-hovered-row-and-column text-nowrap ' + tableClass}>
        <thead>
            <tr>{Array.from({ length: groupOrder }, (_, index) => <th className={getBackgroundColorClass(indexColor(index + 1))}>{indexOutput(index + 1)}</th>)}</tr>
        </thead>
        <tbody>
            {elements.map(startElement => {
                let currentElement: E | undefined = startElement;
                return <tr>
                    {Array.from({ length: groupOrder }, (_, index) => {
                        if (currentElement === undefined) {
                            return <td></td>;
                        } else {
                            const cell = <td className={(index === 0 ? 'font-weight-bold' : '') + getBackgroundColorClass(cellColor(currentElement), index === 0 ? ' ' : '')}>
                                <ClickToCopy>{elementOutput(currentElement)}</ClickToCopy>
                                {order && <sub>{elementOrder(currentElement).toString()}</sub>}
                            </td>;
                            if (index < groupOrder && (!currentElement.equals(identity) || repeat)) {
                                currentElement = operation(currentElement, startElement);
                            } else {
                                currentElement = undefined;
                            }
                            return cell;
                        }
                    })}
                </tr>;
            })}
            {totient && <tr>
                <th>φ(i)</th>
                {Array.from({ length: groupOrder - 1 }, (_, index) => <td>{groupOrder % (index + 2) === 0 && phi(factorize(BigInt(index + 2))!).toString()}</td>)}
            </tr>}
        </tbody>
    </table>;
}
