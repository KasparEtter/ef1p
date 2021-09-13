/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { ObjectButNotFunction } from '../utility/types';

import { ProvidedStore, shareStore } from './share';
import { AllEntries, getCurrentState, VersionedState, VersioningEvent } from './state';
import { Store } from './store';
import { Children } from './utility';

export interface IfFunctionProps<State extends ObjectButNotFunction> {
    function: (state: State) => boolean;
}

export function RawIfFunction<State extends ObjectButNotFunction>(props: Readonly<ProvidedStore<VersionedState<State>, AllEntries<State>, VersioningEvent> & IfFunctionProps<State> & Children>): JSX.Element {
    return <Fragment>
        {props.function(getCurrentState(props.store)) && props.children}
    </Fragment>;
}

export function getIfFunction<State extends ObjectButNotFunction>(store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>) {
    return shareStore<VersionedState<State>, IfFunctionProps<State> & Children, AllEntries<State>, VersioningEvent>(store, 'state')(RawIfFunction);
}
