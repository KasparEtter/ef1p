/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { ObjectButNotFunction } from '../utility/types';

import { ValueType } from './entry';
import { ProvidedStore, shareStore } from './share';
import { AllEntries, getCurrentState, VersionedState, VersioningEvent } from './state';
import { Store } from './store';
import { Children } from './utility';

export interface IfCaseProps<State extends ObjectButNotFunction> {
    entry: keyof State;
    value: ValueType;
    not?: boolean;
}

export function RawIfCase<State extends ObjectButNotFunction>(props: Readonly<ProvidedStore<VersionedState<State>, AllEntries<State>, VersioningEvent> & IfCaseProps<State> & Children>): JSX.Element {
    const currentState = getCurrentState(props.store);
    const equals = props.value === currentState[props.entry] as unknown as ValueType;
    return <Fragment>
        {(!props.not && equals || props.not && !equals) && props.children}
    </Fragment>;
}

export function getIfCase<State extends ObjectButNotFunction>(store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>) {
    return shareStore<VersionedState<State>, IfCaseProps<State> & Children, AllEntries<State>, VersioningEvent>(store, 'state')(RawIfCase);
}
