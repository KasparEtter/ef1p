import { FunctionComponentElement, ReactNode } from 'react';
import { render } from 'react-dom';

/**
 * Declares children to be combined with other properties.
 */
export interface Children {
    children: ReactNode;
}

let keyCounter = 0;
export function getUniqueKey(): number {
    keyCounter += 1
    return keyCounter;
}

export function inject(elementId: string, element: FunctionComponentElement<any>) {
    render(element, document.getElementById(elementId));
}
