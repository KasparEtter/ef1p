import { createElement, Fragment } from 'react';

import { AllEntries, getCurrentState, PersistedState, StateWithOnlyValues } from './entry';
import { ProvidedStore } from './share';
import { Children } from './utility';

export interface IfFunctionProps<State extends StateWithOnlyValues> {
    function: (state: State) => boolean;
}

export function RawIfFunction<State extends StateWithOnlyValues>(props: Readonly<ProvidedStore<PersistedState<State>, AllEntries<State>> & IfFunctionProps<State> & Children>): JSX.Element {
    return <Fragment>
        {props.function(getCurrentState(props.store)) && props.children}
    </Fragment>;
}
