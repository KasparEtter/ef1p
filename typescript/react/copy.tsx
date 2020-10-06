import { createElement, MouseEvent } from 'react';

import { AnimationEffect, copyToClipboardWithAnimation } from '../utility/animation';

import { Children } from './utility';

function handleClick(event: MouseEvent<HTMLSpanElement>) {
    copyToClipboardWithAnimation(
        event.currentTarget.innerText,
        event.currentTarget,
        event.currentTarget.dataset.effect as AnimationEffect | undefined,
    );
}

export interface ClickToCopyProps {
    effect?: AnimationEffect;
}

export function ClickToCopy({ effect, children }: ClickToCopyProps & Children): JSX.Element {
    return <span
        onClick={handleClick}
        className="click-to-copy"
        title="Click to copy."
        data-effect={effect}
    >
        {children}
    </span>;
}
