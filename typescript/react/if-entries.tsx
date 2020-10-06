import { createElement, Fragment } from 'react';

import { KeysOf } from '../utility/types';

import { AllEntries, getCurrentState, PersistedState, ProvidedDynamicEntries, StateWithOnlyValues } from './entry';
import { ProvidedStore } from './share';
import { Children } from './utility';

export function RawIfEntries<State extends StateWithOnlyValues>(props: Readonly<ProvidedStore<PersistedState<State>, AllEntries<State>> & ProvidedDynamicEntries<State> & Children>): JSX.Element {
    const currentState = getCurrentState(props.store);
    return <Fragment>
        {(Object.keys(props.entries) as KeysOf<State>).every(key => !!currentState[key]) && props.children}
    </Fragment>;
}