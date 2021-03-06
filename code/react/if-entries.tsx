import { Fragment } from 'react';

import { KeysOf, ObjectButNotFunction } from '../utility/types';

import { ProvidedStore } from './share';
import { AllEntries, getCurrentState, ProvidedDynamicEntries, VersionedState, VersioningEvent } from './state';
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
