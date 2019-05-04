import { Component, createElement, Fragment, MouseEvent } from 'react';

import { copyToClipboard } from './clipboard';
import { Entry } from './entry';
import { Children } from './types';

export const Code = ({ children }: Children) => <pre>{children}</pre>;

export class Command extends Component<Children, { copyHint: boolean }> {
    public readonly state = { copyHint: false };

    private readonly timeOut = () => this.setState({ copyHint: false });

    private readonly handleClick = (event: MouseEvent<HTMLSpanElement>) => {
        copyToClipboard(event.currentTarget.innerText);
        this.setState({ copyHint: true });
        setTimeout(this.timeOut, 1000);
    }

    public render() {
        return <Fragment>
            <span
                onClick={this.handleClick}
                style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                {this.props.children}
            </span>
            {
                this.state.copyHint &&
                <span
                    className="output"
                    style={{
                        position: 'absolute',
                        top: '0px',
                        right: '0px',
                        zIndex: 1,
                        backgroundColor: 'lightgreen',
                    }}
                >
                    Command copied!
                </span>
            }
        </Fragment>;
    }
}

export const prompt: Entry = {
    name: 'Prompt',
    description: 'How the terminal prompts for user input.',
    type: 'string',
    defaultValue: '$',
    validate: (value: string) => value.length === 0 && 'The prompt may not be empty.',
};

export interface StateWithTerminal {
    prompt: string;
}

export function RawPrompt<State extends StateWithTerminal>({ prompt, children }: State & Children) {
    return <div
        style={{
            position: 'relative',
        }}
    >
        {prompt}
        <Command>
            {children}
        </Command>
    </div>;
}
