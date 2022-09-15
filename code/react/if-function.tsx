/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { BasicState } from './entry';
import { ProvidedStore } from './store';
import { Children } from './utility';
import { VersionedState, VersionedStore, VersioningEvent } from './versioned-store';

export interface IfFunctionProps<State extends BasicState<State>> {
    readonly function: (state: State) => boolean;
}

export function RawIfFunction<State extends BasicState<State>>(props: ProvidedStore<VersionedState<State>, VersioningEvent, VersionedStore<State>> & IfFunctionProps<State> & Children): JSX.Element {
    return <Fragment>
        {props.function(props.store.getCurrentState()) && props.children}
    </Fragment>;
}

export function getIfFunction<State extends BasicState<State>>(store: VersionedStore<State>) {
    return store.injectStore<IfFunctionProps<State> & Children>(RawIfFunction, 'state');
}
