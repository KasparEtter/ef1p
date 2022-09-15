/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { BasicState } from './entry';
import { ProvidedStore } from './store';
import { VersionedState, VersionedStore, VersioningEvent } from './versioned-store';

export interface OutputFunctionProps<State extends BasicState<State>> {
    readonly function: (state: State) => ReactNode;
}

export function RawOutputFunction<State extends BasicState<State>>(props: ProvidedStore<VersionedState<State>, VersioningEvent, VersionedStore<State>> & OutputFunctionProps<State>): JSX.Element {
    return <Fragment>
        {props.function(props.store.getCurrentState())}
    </Fragment>;
}

export function getOutputFunction<State extends BasicState<State>>(store: VersionedStore<State>) {
    return store.injectStore<OutputFunctionProps<State>>(RawOutputFunction, 'state');
}
