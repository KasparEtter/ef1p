import { createElement, Fragment, ReactNode } from 'react';

import { AllEntries, getCurrentState, PersistedState, StateWithOnlyValues } from './entry';
import { ProvidedStore } from './share';

export interface OutputFunctionProps<State extends StateWithOnlyValues> {
    function: (state: State) => ReactNode;
}

export function RawOutputFunction<State extends StateWithOnlyValues>(props: Readonly<ProvidedStore<PersistedState<State>, AllEntries<State>> & OutputFunctionProps<State>>): JSX.Element {
    return <Fragment>
        {props.function(getCurrentState(props.store))}
    </Fragment>;
}
