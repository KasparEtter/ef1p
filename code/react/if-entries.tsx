/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { KeysOf } from '../utility/types';

import { BasicState, ProvidedDynamicEntries } from './entry';
import { ProvidedStore } from './store';
import { Children } from './utility';
import { VersionedState, VersionedStore, VersioningEvent } from './versioned-store';

export interface IfEntriesProps {
    readonly or?: boolean;
    readonly not?: boolean;
}

export function RawIfEntries<State extends BasicState<State>>(props: ProvidedStore<VersionedState<State>, VersioningEvent, VersionedStore<State>> & ProvidedDynamicEntries<State> & IfEntriesProps & Children): JSX.Element {
    const currentState = props.store.getCurrentState();
    return <Fragment>
        {(Object.keys(props.entries) as unknown as KeysOf<State>)[props.or ? 'some' : 'every'](key => currentState[key]) === !props.not && props.children}
    </Fragment>;
}

export function getIfEntries<State extends BasicState<State>>(store: VersionedStore<State>) {
    return store.injectStore<ProvidedDynamicEntries<State> & IfEntriesProps & Children>(RawIfEntries, 'state');
}
