import { Fragment } from 'react';

import { ObjectButNotFunction } from '../utility/types';
import { ValueType } from './entry';

import { ProvidedStore } from './share';
import { AllEntries, getCurrentState, VersionedState, VersioningEvent } from './state';
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
