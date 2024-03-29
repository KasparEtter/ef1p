/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Component, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { EventHandler } from '../utility/types';

/* ------------------------------ Textarea ------------------------------ */

export interface CustomTextareaProps {
    onChange?: EventHandler | undefined;
    onInput?: EventHandler | undefined;
    onEscape?: EventHandler<KeyboardEvent> | undefined;
}

/**
 * This custom textarea component restores the 'onChange' and 'onInput' behavior of JavaScript.
 */
export class CustomTextarea extends Component<Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onInput' | 'ref'> & CustomTextareaProps> {
    private readonly registerCallbacks  = (element: HTMLTextAreaElement | null) => {
        if (element) {
            element.onchange = this.props.onChange ?? null;
            element.oninput = this.props.onInput ?? null;
            element.addEventListener('keyup', (event: KeyboardEvent) => {
                if (event.key === 'Escape' && this.props.onEscape) {
                    event.preventDefault();
                    this.props.onEscape(event);
                }
            });
        }
    };

    public render() {
        return <textarea ref={this.registerCallbacks} {...this.props} onChange={undefined} onInput={undefined} />;
    }
}

/* ------------------------------ Input ------------------------------ */

export interface CustomInputProps extends CustomTextareaProps {
    allowDecimalPoint?: boolean | undefined;
    onEnter?: EventHandler<KeyboardEvent> | undefined;
    onUpOrDown?: EventHandler<KeyboardEvent> | undefined;
}

/**
 * This custom input component restores the 'onChange' and 'onInput' behavior of JavaScript.
 *
 * Please note that the generic 'onChange' handler of entries is triggered on text and number inputs
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
            if (this.props.type === 'text' || this.props.type === 'number') {
                element.addEventListener('keyup', (event: KeyboardEvent) => {
                    if (event.key === 'Escape' && this.props.onEscape) {
                        event.preventDefault();
                        this.props.onEscape(event);
                    }
                    if (event.key === 'Enter' && this.props.onEnter) {
                        event.preventDefault();
                        this.props.onEnter(event);
                    }
                });
                element.addEventListener('keydown', (event: KeyboardEvent) => {
                    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && this.props.onUpOrDown) {
                        event.preventDefault();
                        this.props.onUpOrDown(event);
                    }
                });
            }
            if (this.props.type === 'number' && !this.props.allowDecimalPoint) {
                element.addEventListener('keydown', (event: KeyboardEvent) => {
                    if (event.key === '.') {
                        event.preventDefault();
                    }
                });            }
            element.addEventListener('wheel', (event: WheelEvent) => {
                if (document.activeElement === element) {
                    event.preventDefault();
                }
            });
        }
    };

    public render() {
        return <input ref={this.registerCallbacks} {...this.props} onChange={undefined} onInput={undefined} />;
    }
}
