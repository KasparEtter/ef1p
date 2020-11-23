import { ReactNode } from 'react';

import { textColor } from '../utility/color';
import { normalizeToValue } from '../utility/functions';

import { ClickToCopy } from './copy';
import { DynamicEntry } from './entry';
import { ProvidedStore } from './share';
import { AllEntries, getCurrentState, PersistedState } from './state';
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

function getPrompt(value: string, children: ReactNode): JSX.Element {
    return <div className="prompt">
        <span
            title={prompt.name + ': ' + normalizeToValue(prompt.description, value)}
            className={'dynamic-output' + textColor(normalizeToValue(prompt.outputColor, value))}
        >
            {value}
        </span>
        {' '}
        <ClickToCopy newline>
            {children}
        </ClickToCopy>
    </div>;
}

export function StaticPrompt({ children }: Children): JSX.Element {
    return getPrompt(normalizeToValue(prompt.defaultValue, undefined), children);
}

export interface StateWithPrompt {
    prompt: string;
}

export function RawPrompt<State extends StateWithPrompt>({ store, children }: ProvidedStore<PersistedState<State>, AllEntries<State>> & Children): JSX.Element {
    return getPrompt(getCurrentState(store).prompt, children);
}
