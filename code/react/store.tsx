/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Component, ComponentType, ReactNode } from 'react';

import { getInitializedArray } from '../utility/array';
import { ObjectButNotFunction } from '../utility/types';

import { getDisplayName } from './utility';

export const defaultEvent = 'default';
export type DefaultEvent = typeof defaultEvent;

function normalizeEvents(events: string[]): string[] {
    if (events.length === 0) {
        events.push(defaultEvent);
    }
    return events;
}

export interface ProvidedStore<State extends ObjectButNotFunction, Event extends string, ActualStore extends Store<State, Event>> {
    readonly store: ActualStore;
}

/**
 * This class allows several components to share a single state.
 */
export class Store<State extends ObjectButNotFunction, Event extends string = DefaultEvent> {
    protected state: Readonly<State>;

    /**
     * Creates a new store with the given initial state.
     */
    public constructor(
        protected initialState: Readonly<State>,
    ) {
        this.state = initialState;
    }

    /**
     * Returns the state of this store.
     * The state object may not be mutated.
     */
    public getState(): Readonly<State> {
        return this.state;
    }

    /**
     * The subscribed components indexed by the events they subscribed to.
     */
    protected components: { [key: string]: Component[] | undefined } = {};

    protected subscribe(component: Component, ...events: Event[]): void {
        for (const event of normalizeEvents(events)) {
            getInitializedArray(this.components, event).push(component);
        }
    }

    protected unsubscribe(component: Component, ...events: Event[]): void {
        for (const event of normalizeEvents(events)) {
            const components = getInitializedArray(this.components, event);
            const index = components.indexOf(component);
            if (index === -1) {
                console.error('store.tsx: Tried to unsubscribe a component which was not subscribed.');
            } else {
                components.splice(index, 1);
            }
        }
    }

    public updateComponents(...events: Event[]): void {
        // Copying the arrays is important because the original arrays can change during the update.
        const components = new Set<Component>();
        for (const event of normalizeEvents(events)) {
            for (const component of getInitializedArray(this.components, event)) {
                components.add(component);
            }
        }
        for (const component of components) {
            component.forceUpdate();
        }
    }

    public updateAllComponents(): void {
        this.updateComponents(...Object.keys(this.components) as Event[]);
    }

    /**
     * Sets the state of this store and updates the components subscribed to the given events.
     * Please note that you are allowed to pass a partial state just as in React.
     * You can provide an undefined partial new state if you just want to update the components.
     */
    public setState(partialNewState?: Readonly<Partial<State>>, ...events: Event[]): void {
        if (partialNewState !== undefined) {
            this.state = { ...this.state, ...partialNewState };
        }
        this.updateComponents(...events);
    }

    /**
     * Resets the state of this store to the initial state and updates the components subscribed to the given events.
     */
    public resetState(...events: Event[]): void {
        this.state = this.initialState;
        this.updateComponents(...events);
    }

    /**
     * Injects the store into the wrapped component and triggers an update on the given events.
     */
    public injectStore<ProvidedProps extends ObjectButNotFunction = {}>(
        WrappedComponent: ComponentType<ProvidedStore<State, Event, this> & ProvidedProps>,
        ...events: Event[]
    ) {
        const store = this;
        return class StoreInjector extends Component<ProvidedProps> {
            public static displayName = `StoreInjector(${getDisplayName(WrappedComponent)})`;

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
    }

    /**
     * Injects the state into the wrapped component and triggers an update on the given events.
     */
    public injectState<ProvidedProps extends ObjectButNotFunction = {}>(
        WrappedComponent: ComponentType<State & ProvidedProps>,
        ...events: Event[]
    ) {
        const store = this;
        return class StateInjector extends Component<ProvidedProps> {
            public static displayName = `StateInjector(${getDisplayName(WrappedComponent)})`;

            public componentDidMount(): void {
                store.subscribe(this, ...events);
            }

            public componentWillUnmount(): void {
                store.unsubscribe(this, ...events);
            }

            public render(): ReactNode {
                // This order allows the parent component to override the injected state with properties.
                // In order to do so, 'ProvidedProps' has to include the relevant part of the state.
                return <WrappedComponent {...store.state} {...this.props} />;
            }
        };
    }
}
