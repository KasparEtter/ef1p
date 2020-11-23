import { Fragment } from 'react';

import { ObjectButNotFunction } from '../utility/types';

import { ProvidedStore } from './share';
import { AllEntries, getCurrentState, PersistedState } from './state';
import { Children } from './utility';

export interface IfFunctionProps<State extends ObjectButNotFunction> {
    function: (state: State) => boolean;
}

export function RawIfFunction<State extends ObjectButNotFunction>(props: Readonly<ProvidedStore<PersistedState<State>, AllEntries<State>> & IfFunctionProps<State> & Children>): JSX.Element {
    return <Fragment>
        {props.function(getCurrentState(props.store)) && props.children}
    </Fragment>;
}
