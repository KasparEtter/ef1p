/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { BasicState, BasicValue } from './entry';
import { ProvidedStore } from './store';
import { Children } from './utility';
import { VersionedState, VersionedStore, VersioningEvent } from './versioned-store';

export interface IfCaseProps<State extends BasicState<State>> {
    readonly entry: keyof State;
    readonly value: BasicValue;
    readonly not?: boolean;
}

export function RawIfCase<State extends BasicState<State>>(props: ProvidedStore<VersionedState<State>, VersioningEvent, VersionedStore<State>> & IfCaseProps<State> & Children): JSX.Element {
    const equals = props.value === props.store.getCurrentState()[props.entry];
    return <Fragment>
        {(!props.not && equals || props.not && !equals) && props.children}
    </Fragment>;
}

export function getIfCase<State extends BasicState<State>>(store: VersionedStore<State>) {
    return store.injectStore<IfCaseProps<State> & Children>(RawIfCase, 'state');
}
