import { Component } from 'react';

import { getInitialized } from '../utility/functions';
import { getItem, setItem } from '../utility/storage';
import { ObjectButNotFunction } from '../utility/types';

export type Default = 'default';

function normalizeEvents(events: string[]): string[] {
    if (events.length === 0) {
        events.push('default');
    }
    return events;
}

/**
 * This class allows components to share a common state.
 */
export class Store<State extends ObjectButNotFunction, Meta = undefined, Event extends string = Default> {
    protected components: { [key: string]: Component[] | undefined } = {};

    /**
     * This method should only be called by the Share HOC.
     */
    public subscribe(component: Component, ...events: Event[]): void {
        for (const event of normalizeEvents(events)) {
            getInitialized(this.components, event).push(component);
        }
    }

    /**
     * This method should only be called by the Share HOC.
     */
    public unsubscribe(component: Component, ...events: Event[]): void {
        for (const event of normalizeEvents(events)) {
            const components = getInitialized(this.components, event);
            const index = components.indexOf(component);
            if (index === -1) {
                console.error('store.ts: Tried to unsubscribe a component which was not subscribed.');
            } else {
                components.splice(index, 1);
            }
        }
    }

    /**
     * Call this method after changing the state directly without using the setState method.
     */
    public update(...events: Event[]): void {
        // Copying the arrays is important because the original arrays can change during the update.
        const components = [];
        for (const event of normalizeEvents(events)) {
            components.push(...getInitialized(this.components, event));
        }
        for (const component of components) {
            component.forceUpdate();
        }
    }

    /**
     * Creates a new store with the given initial state.
     * The meta property can be used to pass around additional information.
     */
    public constructor(
        public state: State,
        public readonly meta: Meta,
        public readonly identifier = 'unknown',
    ) {}

    /**
     * Sets the state of this store and updates the subscribed components.
     * Please note that you are allowed to pass a partial state just as in React.
     */
    public setState(partialState: Partial<State>, ...events: Event[]): void {
        Object.assign(this.state, partialState);
        this.update(...events);
    }
}

export interface PersistedState<Event extends string = Default> {
    events?: Event[];
}

/**
 * This class persists the state shared among components.
 */
export class PersistedStore<State extends PersistedState<Event>, Meta = undefined, Event extends string = Default> extends Store<State, Meta, Event> {
    /**
     * Creates a new persisted store with the given default state or the state restored with the given identifier.
     * The meta property can be used to pass around additional information. It is not persisted.
     */
    public constructor(
        public readonly defaultState: State,
        meta: Meta,
        identifier: string,
    ) {
        super(
            {
                ...defaultState,
                ...getItem(
                    identifier,
                    (state: State | undefined) => {
                        if (state !== undefined) {
                            this.state = state;
                            super.update(...state.events ?? []);
                        } else {
                            this.state = defaultState;
                            super.update(...Object.keys(this.components) as Event[]);
                        }
                    },
                ) as State,
            },
            meta,
            identifier,
        );
    }

    public update(...events: Event[]): void {
        super.update(...events);
        this.state.events = events;
        setItem(this.identifier, this.state);
    }
}
