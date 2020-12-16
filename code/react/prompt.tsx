import { ReactNode } from 'react';

import { textColor } from '../utility/color';
import { normalizeToValue } from '../utility/functions';

import { ClickToCopy } from './copy';
import { DynamicEntry } from './entry';
import { ProvidedStore } from './share';
import { AllEntries, getCurrentState, VersionedState, VersioningEvent } from './state';
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

function getPrompt(value: string, children: ReactNode, noNewline?: boolean): JSX.Element {
    return <div className="prompt">
        <span
            title={prompt.name + ': ' + normalizeToValue(prompt.description, value)}
            className={'dynamic-output' + textColor(normalizeToValue(prompt.outputColor, value))}
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
    return getPrompt(normalizeToValue(prompt.defaultValue, undefined), children, noNewline);
}

export interface StateWithPrompt {
    prompt: string;
}

export function RawPrompt<State extends StateWithPrompt>({ store, children, noNewline }: ProvidedStore<VersionedState<State>, AllEntries<State>, VersioningEvent> & Children & PromptProps): JSX.Element {
    return getPrompt(getCurrentState(store).prompt, children, noNewline);
}
