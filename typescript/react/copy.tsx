import { createElement, MouseEvent } from 'react';

import { copyToClipboardWithAnimation } from '../utility/animation';

import { Children } from './utility';

function handleClick(event: MouseEvent<HTMLSpanElement>) {
    copyToClipboardWithAnimation(event.currentTarget.innerText, event.currentTarget);
}

export function ClickToCopy({ children }: Children): JSX.Element {
    return <span
            onClick={handleClick}
            className="click-to-copy"
            title="Click to copy."
        >
            {children}
        </span>;
}
