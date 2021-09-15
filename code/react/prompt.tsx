/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ReactNode } from 'react';

import { colorClass } from '../utility/color';
import { normalizeToValue } from '../utility/normalization';

import { ClickToCopy } from './copy';
import { DynamicEntry } from './entry';
import { ProvidedStore, shareStore } from './share';
import { AllEntries, getCurrentState, VersionedState, VersioningEvent } from './state';
import { Store } from './store';
import { Children } from './utility';

export const prompt: DynamicEntry<string> = {
    name: 'Prompt',
    description: 'How the command-line interface prompts for user input.',
    defaultValue: '$',
    outputColor: 'pink',
    inputType: 'text',
    labelWidth: 58,
    validate: (value: string) => value.length === 0 && 'The prompt may not be empty.',
};

function renderPrompt(value: string, children: ReactNode, noNewline?: boolean): JSX.Element {
    return <div className="prompt">
        <span
            title={prompt.name + ': ' + normalizeToValue(prompt.description, value)}
            className={'dynamic-output' + colorClass(normalizeToValue(prompt.outputColor, value))}
        >
            {value}
        </span>
        {' '}
        <ClickToCopy newline={!noNewline}>
            {children}
        </ClickToCopy>
    </div>;
}

export interface PromptProps {
    /**
     * Append no newline character when copying the prompt to the clipboard.
     */
    noNewline?: boolean;
}

export function StaticPrompt({ children, noNewline }: Children & PromptProps): JSX.Element {
    return renderPrompt(normalizeToValue(prompt.defaultValue, undefined), children, noNewline);
}

export interface StateWithPrompt {
    prompt: string;
}

export function RawPrompt<State extends StateWithPrompt>({ store, children, noNewline }: ProvidedStore<VersionedState<State>, AllEntries<State>, VersioningEvent> & PromptProps & Children): JSX.Element {
    return renderPrompt(getCurrentState(store).prompt, children, noNewline);
}

export function getPrompt<State extends StateWithPrompt>(store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>) {
    return shareStore<VersionedState<State>, PromptProps & Children, AllEntries<State>, VersioningEvent>(store, 'state')(RawPrompt);
}
