import { Component } from 'react';
import { restoreObject, storeObject } from './storage';
import { ObjectButNotFunction } from './types';

/**
 * This class allows components to share a common state.
 */
export class Store<State extends ObjectButNotFunction> {
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

    private updateComponents(): void {
        for (const component of this.components) {
            component.forceUpdate();
        }
    }

    /**
     * Creates a new store with the given initial state.
     */
    public constructor(public readonly state: Readonly<State>) {}

    /**
     * Sets the state of this store and updates the subscribed components.
     * Please note that you are allowed to pass a partial state just as in React.
     */
    public setState(partialState: Partial<State>): void {
        Object.assign(this.state, partialState);
        this.updateComponents();
    }
}

/**
 * This class persists the state shared among components.
 */
export class PersistedStore<State extends ObjectButNotFunction> extends Store<State> {
    /**
     * Creates a new persisted store with the given default state or the state with the given name.
     */
    public constructor(state: Readonly<State>, private readonly name: string) {
        super(restoreObject(name) as State || state);
    }

    public setState(partialState: Partial<State>): void {
        super.setState(partialState);
        storeObject(this.name, this.state);
    }
}
