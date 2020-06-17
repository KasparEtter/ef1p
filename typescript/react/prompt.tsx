import { createElement } from 'react';

import { Command } from './command';
import { DynamicEntry, StateWithOnlyValues } from './entry';
import { ProvidedStore } from './share';
import { Children } from './utility';
import { ValueWithHistory } from './value';

export const prompt: DynamicEntry<string> = {
    name: 'Prompt',
    description: 'How the terminal prompts for user input.',
    defaultValue: '$',
    outputColor: 'pink',
    inputType: 'text',
    labelWidth: 58,
    validate: (value: string) => value.length === 0 && 'The prompt may not be empty.',
};

export interface StateWithPrompt extends StateWithOnlyValues {
    prompt: ValueWithHistory<string>;
}

export function RawPrompt<State extends StateWithPrompt>({ store, children }: ProvidedStore<State> & Children) {
    return <div className="position-relative">
        <span
            title={prompt.name + ': ' + prompt.description}
            className={'dynamic-output' + (prompt.outputColor ? ' text-' + prompt.outputColor : '')}
        >
            {store.state.prompt.value}
        </span>
        {' '}
        <Command>
            {children}
        </Command>
    </div>;
}
