/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { getColorClass } from '../utility/color';
import { normalizeToValue } from '../utility/normalization';

import { ClickToCopy } from './copy';
import { BasicState, DynamicTextEntry } from './entry';
import { ProvidedStore } from './store';
import { Children } from './utility';
import { VersionedState, VersionedStore, VersioningEvent } from './versioned-store';

export const prompt: DynamicTextEntry = {
    label: 'Prompt',
    tooltip: 'How the command-line interface prompts for user input.',
    defaultValue: '$',
    outputColor: 'pink',
    inputType: 'text',
    validateIndependently: input => input.length === 0 && 'The prompt may not be empty.',
};

function renderPrompt(text: string, noNewline: boolean | undefined, children: ReactNode): JSX.Element {
    return <div className="prompt">
        {text !== '' && <Fragment>
            <span
                title={prompt.label + ': ' + normalizeToValue(prompt.tooltip, text)}
                className={'dynamic-output' + getColorClass(normalizeToValue(prompt.outputColor, text), ' ')}
            >
                {text}
            </span>
            {' '}
        </Fragment>}
        <ClickToCopy newline={!noNewline}>
            {children}
        </ClickToCopy>
    </div>;
}

export interface PromptProps {
    /**
     * The text with which the user is prompted.
     * Defaults to the dollar sign.
     */
    readonly text?: string;

    /**
     * Append no newline character when copying the prompt to the clipboard.
     */
    readonly noNewline?: boolean;
}

export function StaticPrompt({ text, noNewline, children }: PromptProps & Children): JSX.Element {
    return renderPrompt(text ?? prompt.defaultValue, noNewline, children);
}

export interface StateWithPrompt {
    readonly prompt: string;
}

function RawPrompt<State extends BasicState<State> & StateWithPrompt>({ store, children, noNewline }: ProvidedStore<VersionedState<State>, VersioningEvent, VersionedStore<State>> & PromptProps & Children): JSX.Element {
    return renderPrompt(store.getCurrentState().prompt, noNewline, children);
}

export function getPrompt<State extends BasicState<State> & StateWithPrompt>(store: VersionedStore<State>) {
    return store.injectStore<PromptProps & Children>(RawPrompt, 'state');
}
