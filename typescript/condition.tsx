import { createElement, Fragment } from 'react';

import { SomeEntries } from './entry';
import { Children, KeysOf } from './types';

export function RawCondition<State>(props: Readonly<State & SomeEntries<State> & Children>) {
    return <Fragment>
        {
            (Object.keys(props.entries) as KeysOf<State>).every(key => !!props[key]) &&
            props.children
        }
    </Fragment>;
}
