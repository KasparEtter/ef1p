/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { getItem, removeItem, setItem } from '../utility/storage';
import { Condition } from '../utility/types';

import { DefaultEvent, Store } from './store';

export interface PersistedState<Event extends string = DefaultEvent> {
    events?: Event[];
}

/**
 * This class persists the state shared among components in the local storage.
 */
export class PersistedStore<State extends PersistedState<Event>, Event extends string = DefaultEvent> extends Store<State, Event> {
    /**
     * Creates a new persisted store with the given default state or the state restored with the given identifier.
     */
    public constructor(
        protected readonly defaultState: Readonly<State>,
        public readonly identifier = 'unknown',
        isStale?: Condition<State>,
    ) {
        super(
            {
                ...defaultState,
                ...getItem(
                    identifier,
                    (state: State | null) => {
                        const oldState = this.state;
                        if (state !== null) {
                            this.state = state;
                            this.updateComponents(...state.events ?? []);
                        } else { // The item has been removed.
                            this.state = defaultState;
                            this.updateAllComponents();
                        }
                        this.onStateChange(this.state, oldState);
                    },
                    isStale,
                ),
            },
        );
    }

    // tslint:disable-next-line:no-empty
    protected onStateChange(newState: Readonly<State>, oldState: Readonly<State>): void {}

    public setState(partialNewState?: Readonly<Partial<State>>, ...events: Event[]): void {
        setItem(this.identifier, { ...this.state, ...partialNewState, events });
    }

    /**
     * Removes the state from the local storage and resets this store to its default state.
     */
    public resetState(): void {
        removeItem(this.identifier);
    }
}
