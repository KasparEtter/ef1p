import { createElement, Fragment } from 'react';

import { KeysOf } from '../utility/types';

import { ProvidedDynamicEntries, StateWithOnlyValues } from './entry';
import { ProvidedStore } from './share';
import { Children } from './utility';

export function RawCondition<State extends StateWithOnlyValues>(props: Readonly<ProvidedStore<State> & ProvidedDynamicEntries<State> & Children>) {
    return <Fragment>
        {(Object.keys(props.entries) as KeysOf<State>).every(key => !!props.store.state[key].value) && props.children}
    </Fragment>;
}
