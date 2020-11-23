import { Fragment, ReactNode } from 'react';

import { ObjectButNotFunction } from '../utility/types';

import { ProvidedStore } from './share';
import { AllEntries, getCurrentState, PersistedState } from './state';

export interface OutputFunctionProps<State extends ObjectButNotFunction> {
    function: (state: State) => ReactNode;
}

export function RawOutputFunction<State extends ObjectButNotFunction>(props: Readonly<ProvidedStore<PersistedState<State>, AllEntries<State>> & OutputFunctionProps<State>>): JSX.Element {
    return <Fragment>
        {props.function(getCurrentState(props.store))}
    </Fragment>;
}
