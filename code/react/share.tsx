/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Component, ComponentType, ReactNode } from 'react';

import { ObjectButNotFunction } from '../utility/types';

import { Default, Store } from './store';
import { getDisplayName } from './utility';

export interface ProvidedStore<SharedState extends ObjectButNotFunction, Meta = undefined, Event extends string = Default> {
    store: Store<SharedState, Meta, Event>;
}

/**
 * Shares a store among all instances of the wrapped component.
 * This allows the wrapped component to update the shared state.
 */
export function shareStore<SharedState extends ObjectButNotFunction, ProvidedProps extends ObjectButNotFunction = {}, Meta = undefined, Event extends string = Default>(
    store: Store<SharedState, Meta, Event>,
    ...events: Event[]
) {
    return function decorator(
        WrappedComponent: ComponentType<ProvidedStore<SharedState, Meta, Event> & ProvidedProps>,
    ) {
        return class Share extends Component<ProvidedProps> {
            public static displayName = `ShareStore(${getDisplayName(WrappedComponent)})`;

            public componentDidMount(): void {
                store.subscribe(this, ...events);
            }

            public componentWillUnmount(): void {
                store.unsubscribe(this, ...events);
            }

            public render(): ReactNode {
                return <WrappedComponent store={store} {...this.props} />;
            }
        };
    };
}

/**
 * Shares a the state of a store among all instances of the wrapped component.
 *
 * @param store - The store whose state is shared among all instances of the wrapped component.
 * @return A function that returns the higher-order component that shares the state of the store as props.
 *
 * Example:
 * ```
 * interface SharedState {
 *     value: number;
 * }
 *
 * const store = new Store<SharedState>({ value: 1 });
 *
 * function incrementValue() {
 *     store.setState({ value: store.state.value + 1});
 * }
 *
 * class RawCounter extends Component<SharedProps> {
 *     public render(): ReactNode {
 *         return <div onClick={incrementValue}>Value: { this.props.value }</div>;
 *     }
 * }
 *
 * export const Counter = shareState(store)(RawCounter);
 * ```
 */
export function shareState<SharedState extends ObjectButNotFunction, ProvidedProps extends ObjectButNotFunction = {}, Meta = undefined, Event extends string = Default>(
    store: Store<SharedState, Meta, Event>,
    ...events: Event[]
) {
    return function decorator(
        WrappedComponent: ComponentType<SharedState & ProvidedProps>,
    ) {
        return class Share extends Component<ProvidedProps & Partial<SharedState>> {
            public static displayName = `ShareState(${getDisplayName(WrappedComponent)})`;

            public componentDidMount(): void {
                store.subscribe(this, ...events);
            }

            public componentWillUnmount(): void {
                store.unsubscribe(this, ...events);
            }

            public render(): ReactNode {
                // This order allows the parent component to override the shared state with properties.
                return <WrappedComponent {...store.state} {...this.props} />;
            }
        };
    };
}
