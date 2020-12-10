import { Component, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { EventHandler } from '../utility/types';

/* ------------------------------ Textarea ------------------------------ */

export interface CustomTextareaProps {
    onChange?: EventHandler;
    onInput?: EventHandler;
}

/**
 * This custom textarea component restores the 'onChange' and 'onInput' behavior of JavaScript.
 */
export class CustomTextarea extends Component<Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onInput' | 'ref'> & CustomTextareaProps> {
    private readonly registerCallbacks  = (element: HTMLTextAreaElement | null) => {
        if (element) {
            element.onchange = this.props.onChange ?? null;
            element.oninput = this.props.onInput ?? null;
        }
    };

    public render() {
        return <textarea ref={this.registerCallbacks} {...this.props} onChange={undefined} onInput={undefined} />;
    }
}

/* ------------------------------ Input ------------------------------ */

export interface CustomInputProps extends CustomTextareaProps {
    onEnter?: EventHandler;
}

/**
 * This custom input component restores the 'onChange' and 'onInput' behavior of JavaScript.
 *
 * Please note that 'onChange' is always triggered on text and number inputs
 * when the user presses enter in order to retrigger API requests.
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
                    if (event.key === 'Enter' && this.props.onEnter) {
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
