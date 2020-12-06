import { Component, ComponentType, ReactNode } from 'react';

import { ObjectButNotFunction } from '../utility/types';

import { Default, Store } from './store';

function getDisplayName(component: ComponentType<any>): string {
    return component.displayName || (component as any).name || 'Component';
}

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
 * class Counter extends Component<SharedProps> {
 *     public render(): ReactNode {
 *         return <div onClick={incrementValue}>Value: { this.props.value }</div>;
 *     }
 * }
 *
 * const HOC = shareState(store)(Counter);
 * export { HOC as Counter };
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
