/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Component, Fragment, ReactElement, ReactNode } from 'react';

import { sleep } from '../../utility/async';
import { getErrorMessage } from '../../utility/error';
import { EventHandler } from '../../utility/types';

import { BasicState, DynamicRangeEntry } from '../../react/entry';
import { Store } from '../../react/store';

import { Integer } from '../../math/formatting';
import { IntegerFormat } from '../../math/integer';
import { zero } from '../../math/utility';

import { warningSymbol } from './warning';

export const minDelay = 33;

/* ------------------------------ Entries ------------------------------ */

export const delay: DynamicRangeEntry = {
    label: 'Delay',
    tooltip: 'Configure the delay in seconds when animating the algorithm.',
    defaultValue: 0.2,
    inputType: 'range',
    inputWidth: 120,
    minValue: 0,
    maxValue: 2,
    stepValue: 0.05,
    digits: 2,
};

/* ------------------------------ Output states ------------------------------ */

export interface AnimationOutputState {
    error: ReactNode;
    paused: boolean;
    finished: boolean;
}

export const initialAnimationOutputState: AnimationOutputState = {
    error: undefined,
    paused: false,
    finished: false,
}

export interface MeteredAnimationOutputState extends AnimationOutputState {
    steps: bigint;
    startTime: number;
}

export const initialMeteredAnimationOutputState: MeteredAnimationOutputState = {
    ...initialAnimationOutputState,
    steps: zero,
    startTime: 0,
}

export interface IntegerMeteredAnimationOutputState extends MeteredAnimationOutputState {
    format: IntegerFormat;
}

export const initialIntegerMeteredAnimationOutputState: IntegerMeteredAnimationOutputState = {
    ...initialMeteredAnimationOutputState,
    format: 'decimal',
}

/* ------------------------------ Animation ------------------------------ */

class SharedPromise {
    public resolve?: () => void;
    public reject?: (message?: string) => void;
    public readonly promise: Promise<void>;
    public constructor() {
        this.promise = new Promise<void>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

function createButton(onClick: EventHandler<any>, label: string, title: string): JSX.Element {
    return <button type="button" className="btn btn-primary btn-sm margin-left-to-same" key={label} onClick={onClick} title={title}>{label}</button>;
}

const errorMessage = 'Animation aborted.';

export type SetOutput<OutputState> = (delay: number, partialNewState?: Readonly<Partial<OutputState>>) => Promise<void>;

export function createAnimation<InputState extends BasicState<InputState>, OutputState extends AnimationOutputState>(
    initialOutputState: OutputState,
    renderOnlyIf: (state: Readonly<OutputState>) => boolean,
    render: (state: Readonly<OutputState>) => ReactElement,
    run: (state: Readonly<InputState>, setOutput: SetOutput<OutputState>) => Promise<void>,
    onStart?: (state: Readonly<OutputState>) => Readonly<Partial<OutputState>>,
    onPause?: (state: Readonly<OutputState>) => Readonly<Partial<OutputState>>,
    onContinue?: (state: Readonly<OutputState>) => Readonly<Partial<OutputState>>,
): [(state: Readonly<InputState>) => any, typeof Component] {
    const store = new Store<OutputState>(initialOutputState);

    let globalCounter = 0;

    let promise: SharedPromise | undefined;

    function pause(): void {
        promise = new SharedPromise();
        store.setState({ paused: true, ...onPause?.(store.getState()) } as Partial<OutputState>);
    }

    // Continue is a keyword.
    function _continue(): void {
        if (promise !== undefined) {
            promise.resolve?.();
            promise = undefined;
        }
        store.setState({ paused: false, ...onContinue?.(store.getState()) } as Partial<OutputState>);
    }

    function clear(): void {
        globalCounter++;
        if (promise !== undefined) {
            promise.reject?.(errorMessage);
            promise = undefined;
        }
        store.resetState();
    }

    const pauseButton = createButton(pause, 'Pause', 'Pause the algorithm.');
    const continueButton = createButton(_continue, 'Continue', 'Continue the algorithm.');
    const clearButton = createButton(clear, 'Clear', 'Abort and clear the output.');

    function RawOutput(state: Readonly<OutputState>): ReactElement | null {
        if (renderOnlyIf(state)) {
            return <Fragment>
                {render(state)}
                {state.error && <p className="text-center">
                    {warningSymbol} {state.error}
                </p>}
                <p className="text-center">
                    {!state.paused && !state.finished && pauseButton}
                    {state.paused && continueButton}
                    {clearButton}
                </p>
            </Fragment>;
        } else {
            return null;
        }
    }

    const Output = store.injectState<{}>(RawOutput);

    async function internalRun(state: Readonly<InputState>): Promise<void> {
        clear();
        const localCounter = globalCounter;

        async function setOutput(delay: number, partialNewState?: Readonly<Partial<OutputState>>): Promise<void> {
            store.setState(partialNewState);
            if (delay > 0) {
                await sleep(delay);
                if (localCounter !== globalCounter) {
                    throw new Error(errorMessage);
                }
                if (promise !== undefined) {
                    await promise.promise;
                }
            }
        }

        try {
            if (onStart !== undefined) {
                await setOutput(0, onStart(store.getState()));
            }
            await run(state, setOutput);
            store.setState({ finished: true } as Partial<OutputState>);
        } catch (error) {
            if (getErrorMessage(error) !== errorMessage) {
                throw error;
            }
        }
    }

    return [internalRun, Output];
}

export function createMeteredAnimation<InputState extends BasicState<InputState>, OutputState extends MeteredAnimationOutputState>(
    initialOutputState: OutputState,
    renderOnlyIf: (state: Readonly<OutputState>) => boolean,
    render: (state: Readonly<OutputState>) => ReactElement,
    run: (state: Readonly<InputState>, setOutput: SetOutput<OutputState>, displaySteps: boolean) => Promise<void>,
    displaySteps = true,
): [(state: Readonly<InputState>) => any, typeof Component] {
    let paused = 0;
    return createAnimation(
        initialOutputState,
        renderOnlyIf,
        state => displaySteps ? <Fragment>
            <p className="text-center"><Integer integer={state.steps}/> steps in {((performance.now() - state.startTime) / 1000).toFixed(2)} s</p>
            {render(state)}
        </Fragment> : render(state),
        async (state, setOutput) => { await run(state, setOutput, displaySteps); },
        () => ({ startTime: performance.now() } as Partial<OutputState>),
        () => { paused = performance.now(); return {} as Partial<OutputState>; },
        (state: Readonly<OutputState>) => ({ startTime: state.startTime + performance.now() - paused } as Partial<OutputState>),
    );
}
