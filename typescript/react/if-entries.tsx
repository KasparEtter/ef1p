import { Fragment } from 'react';

import { KeysOf, ObjectButNotFunction } from '../utility/types';

import { ProvidedStore } from './share';
import { AllEntries, getCurrentState, PersistedState, ProvidedDynamicEntries } from './state';
import { Children } from './utility';

export interface IfEntriesProps {
    or?: boolean;
    not?: boolean;
}

export function RawIfEntries<State extends ObjectButNotFunction>(props: Readonly<ProvidedStore<PersistedState<State>, AllEntries<State>> & ProvidedDynamicEntries<State> & IfEntriesProps & Children>): JSX.Element {
    const currentState = getCurrentState(props.store);
    return <Fragment>
        {(Object.keys(props.entries) as KeysOf<State>)[props.or ? 'some' : 'every'](key => currentState[key]) === !props.not && props.children}
    </Fragment>;
}
