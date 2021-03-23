import { KeyboardEvent, MouseEvent } from 'react';

import { AnimationEffect, copyToClipboardWithAnimation } from '../utility/animation';

import { Children } from './utility';

function copy(target: EventTarget & HTMLSpanElement): void {
    if (copyToClipboardWithAnimation(
        target.innerText + (target.dataset.newline === 'true' ? '\n' : ''),
        target,
        target.dataset.effect as AnimationEffect | undefined,
    )) {
        target.focus();
    }
}

function handleClick(event: MouseEvent<HTMLSpanElement>): void {
    copy(event.currentTarget)
}

function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>): void {
    if (event.key === 'Enter') {
        event.preventDefault();
        copy(event.currentTarget);
    }
    if (event.key === ' ') {
        event.preventDefault();
    }
}

function handleKeyUp(event: KeyboardEvent<HTMLSpanElement>): void {
    if (event.key === ' ') {
        event.preventDefault();
        copy(event.currentTarget);
    }
}

export interface ClickToCopyProps {
    /**
     * Whether to append a newline character to the text. Defaults to false.
     */
    newline?: boolean;

    /**
     * The animation effect used to animate the span element. Defaults to 'scale150'.
     */
    effect?: AnimationEffect;
}

export function ClickToCopy({ newline, effect, children }: ClickToCopyProps & Children): JSX.Element {
    return <span
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className="click-to-copy"
        title="Click to copy."
        tabIndex={0}
        data-newline={newline}
        data-effect={effect}
    >
        {children}
    </span>;
}
