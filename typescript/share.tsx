import { Component, ComponentType, createElement, ReactNode } from 'react';

import { Store } from './store';
import { ObjectButNotFunction } from './types';

function getDisplayName(component: ComponentType<any>): string {
    return component.displayName || (component as any).name || 'Component';
}

/**
 * Shares a store with its state among all instances of the wrapped component.
 *
 * @param store - The store whose state is shared among all instances of the wrapped component.
 * @return A function that returns the higher-order component that shares the state of the store as props.
 *
 * Example:
 * ```
 * interface SharedProps {
 *     value: number;
 * }
 *
 * const store = new Store<SharedProps>({ value: 1 });
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
 * const HOC = share(store)(Counter);
 * export { HOC as Counter };
 * ```
 */
export function share<SharedProps extends ObjectButNotFunction, ProvidedProps extends ObjectButNotFunction = {}>(
    store: Store<SharedProps>,
) {
    return function decorator(
        WrappedComponent: ComponentType<{ store: Store<SharedProps> } & SharedProps & ProvidedProps>,
    ) {
        return class Share extends Component<ProvidedProps & Partial<SharedProps>> {
            public static displayName = `Share(${getDisplayName(WrappedComponent)})`;

            public componentDidMount(): void {
                store.subscribe(this);
            }

            public componentWillUnmount(): void {
                store.unsubscribe(this);
            }

            public render(): ReactNode {
                // This order allows the parent component to override the shared store with properties.
                return <WrappedComponent store={store} {...store.state} {...this.props} />;
            }
        };
    };
}
