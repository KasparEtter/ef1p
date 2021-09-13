/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { KeysOf, ObjectButNotFunction } from '../utility/types';

import { ProvidedStore, shareStore } from './share';
import { AllEntries, getCurrentState, ProvidedDynamicEntries, VersionedState, VersioningEvent } from './state';
import { Store } from './store';
import { Children } from './utility';

export interface IfEntriesProps {
    or?: boolean;
    not?: boolean;
}

export function RawIfEntries<State extends ObjectButNotFunction>(props: Readonly<ProvidedStore<VersionedState<State>, AllEntries<State>, VersioningEvent> & ProvidedDynamicEntries<State> & IfEntriesProps & Children>): JSX.Element {
    const currentState = getCurrentState(props.store);
    return <Fragment>
        {(Object.keys(props.entries) as KeysOf<State>)[props.or ? 'some' : 'every'](key => currentState[key]) === !props.not && props.children}
    </Fragment>;
}

export function getIfEntries<State extends ObjectButNotFunction>(store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>) {
    return shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & IfEntriesProps & Children, AllEntries<State>, VersioningEvent>(store, 'state')(RawIfEntries);
}
