/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { filterUndefined } from '../../utility/array';
import { getBackgroundColorClass } from '../../utility/color';

import { ClickToCopy } from '../../react/copy';
import { DynamicBooleanEntry, DynamicRangeEntry } from '../../react/entry';
import { Store } from '../../react/store';

import { Group, GroupElement } from '../../math/group';

/* ------------------------------ Input ------------------------------ */

export const unique: DynamicBooleanEntry<CosetState> = {
    label: 'Unique',
    tooltip: 'Whether to filter for unique cosets.',
    defaultValue: false,
    inputType: 'switch',
};

export const delay: DynamicRangeEntry<CosetState> = {
    label: 'Delay',
    tooltip: 'Configure the delay in seconds when highlighting elements.',
    defaultValue: 0.5,
    inputType: 'range',
    inputWidth: 50,
    minValue: 0,
    maxValue: 2,
    stepValue: 0.5,
    digits: 1,
};

export interface CosetState {
    unique: boolean;
    delay: number;
}

/* ------------------------------ Output ------------------------------ */

export interface CosetOutputState<G extends Group<G, E>, E extends GroupElement<G, E>> {
    elements: E[];
    subgroup: E[];
    cosets: E[][];
    highlight: number;
    interval: number | undefined;
    classes: string;
}

const color = getBackgroundColorClass('blue');

export function RawCosetOutput<G extends Group<G, E>, E extends GroupElement<G, E>>({ elements, subgroup, cosets, highlight, classes }: CosetOutputState<G, E>): JSX.Element {
    return <table className={'table-with-borders table-with-vertical-border-after-column-1 highlight-hovered-row-and-column text-nowrap ' + classes}>
        <thead>
            <tr>{subgroup.map(element => <th className={highlight !== -1 && element.equals(elements[highlight]) ? color : undefined}><ClickToCopy>{element.toString()}</ClickToCopy></th>)}</tr>
        </thead>
        <tbody>
            {cosets.map(coset => <tr>
                {coset.map((element, index) => <td className={filterUndefined([index === 0 ? 'font-weight-bold' : undefined, highlight !== -1 && element.equals(elements[highlight]) ? color : undefined]).join(' ')}><ClickToCopy>{element.toString()}</ClickToCopy></td>)}
            </tr>)}
        </tbody>
    </table>;
}

export function getCosetOutputStore<G extends Group<G, E>, E extends GroupElement<G, E>>(classes: string): Store<CosetOutputState<G, E>> {
    return new Store<CosetOutputState<G, E>>({ elements: [], subgroup: [], cosets: [], highlight: -1, interval: undefined, classes });
}

export function updateCosetOutput<G extends Group<G, E>, E extends GroupElement<G, E>, State extends CosetState>(
    element: E,
    state: State,
    store: Store<CosetOutputState<G, E>>,
    load: boolean,
): void {
    const subgroup = [element.group.identity];
    const coveredElements = new Set<string>();
    coveredElements.add(element.group.identity.toString());
    let currentElement = element;
    while (!currentElement.isIdentity()) {
        subgroup.push(currentElement);
        coveredElements.add(currentElement.toString());
        currentElement = currentElement.combine(element);
    }
    const elements = element.group.getAllElements();
    const cosets = new Array<E[]>();
    for (let i = 1; i < elements.length; i++) {
        if (!state.unique || !coveredElements.has(elements[i].toString())) {
            cosets.push(subgroup.map(element => {
                const mappedElement = element.combine(elements[i]);
                coveredElements.add(mappedElement.toString());
                return mappedElement;
            }));
        }
    }
    let interval = store.getState().interval;
    if (interval !== undefined) {
        clearInterval(interval);
    }
    const animate = !load && state.delay > 0;
    if (animate) {
        interval = window.setInterval(() => {
            const highlight = store.getState().highlight + 1;
            if (highlight < elements.length) {
                store.setState({ highlight });
            } else {
                store.setState({ highlight: -1 });
                clearInterval(interval);
            }
        }, state.delay * 1000);
    }
    store.setState({ elements, subgroup, cosets, highlight: animate ? 0 : -1, interval });
}
