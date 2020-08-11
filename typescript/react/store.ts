import { Component } from 'react';

import { restoreObject, storeObject } from '../utility/storage';
import { ObjectButNotFunction } from '../utility/types';

/**
 * This class allows components to share a common state.
 */
export class Store<State extends ObjectButNotFunction, Meta = undefined> {
    private components: Component[] = [];

    /**
     * This method should only be called by the Share HOC.
     */
    public subscribe(component: Component): void {
        this.components.push(component);
    }

    /**
     * This method should only be called by the Share HOC.
     */
    public unsubscribe(component: Component): void {
        const index = this.components.indexOf(component);
        this.components.splice(index, 1);
    }

    /**
     * Call this method after changing the state directly without using the setState method.
     */
    public update(): void {
        for (const component of this.components) {
            component.forceUpdate();
        }
    }

    /**
     * Creates a new store with the given initial state.
     * The meta property can be used to pass around additional information.
     */
    public constructor(public state: State, public readonly meta: Meta) {}

    /**
     * Sets the state of this store and updates the subscribed components.
     * Please note that you are allowed to pass a partial state just as in React.
     */
    public setState(partialState: Partial<State>): void {
        Object.assign(this.state, partialState);
        this.update();
    }
}

/**
 * This class persists the state shared among components.
 */
export class PersistedStore<State extends ObjectButNotFunction, Meta = undefined> extends Store<State, Meta> {
    /**
     * Creates a new persisted store with the given default state or the state restored with the given identifier.
     * The meta property can be used to pass around additional information. It is not persisted.
     */
    public constructor(defaultState: State, meta: Meta, public readonly identifier: string) {
        super({ ...defaultState, ...restoreObject(identifier) as State }, meta);
    }

    public update(): void {
        super.update();
        storeObject(this.identifier, this.state);
    }
}
