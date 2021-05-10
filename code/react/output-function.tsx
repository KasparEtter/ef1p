/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { ObjectButNotFunction } from '../utility/types';

import { ProvidedStore } from './share';
import { AllEntries, getCurrentState, VersionedState, VersioningEvent } from './state';

export interface OutputFunctionProps<State extends ObjectButNotFunction> {
    function: (state: State) => ReactNode;
}

export function RawOutputFunction<State extends ObjectButNotFunction>(props: Readonly<ProvidedStore<VersionedState<State>, AllEntries<State>, VersioningEvent> & OutputFunctionProps<State>>): JSX.Element {
    return <Fragment>
        {props.function(getCurrentState(props.store))}
    </Fragment>;
}
