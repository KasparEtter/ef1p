import { Component, createElement, InputHTMLAttributes } from 'react';

export interface CustomInputProps {
    onChange?: (event: Event) => void;
    onInput?: (event: Event) => void;
    onEnter?: (event: Event) => void;
}

/**
 * This custom input component restores the 'onChange' and 'onInput' behavior of JavaScript.
 *
 * Please note that 'onChange' is always triggered when the user presses enter in order to retrigger API requests.
 *
 * See:
 * - https://reactjs.org/docs/dom-elements.html#onchange
 * - https://github.com/facebook/react/issues/3964
 * - https://github.com/facebook/react/issues/9657
 * - https://github.com/facebook/react/issues/14857
 */
export class CustomInput extends Component<Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onInput' | 'ref'> & CustomInputProps> {
    private readonly registerCallbacks  = (element: HTMLInputElement | null) => {
        if (element) {
            element.onchange = this.props.onChange ?? null;
            element.oninput = this.props.onInput ?? null;
            if ((this.props.type === 'text' || this.props.type === 'number') && this.props.onEnter) {
                element.onkeydown = (event: KeyboardEvent) => {
                    if (event.keyCode === 13 && this.props.onEnter) {
                        this.props.onEnter(event);
                        event.preventDefault();
                    }
                };
            }
        }
    };

    public render() {
        return <input ref={this.registerCallbacks} {...this.props} onChange={undefined} onInput={undefined} />;
    }
}
