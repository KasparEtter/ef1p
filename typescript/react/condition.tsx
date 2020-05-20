import { createElement, Fragment } from 'react';

import { Children, KeysOf } from '../utility/types';
import { SomeEntries } from './entry';

export function RawCondition<State>(props: Readonly<State & SomeEntries<State> & Children>) {
    return <Fragment>
        {
            (Object.keys(props.entries) as KeysOf<State>).every(key => !!props[key]) &&
            props.children
        }
    </Fragment>;
}
