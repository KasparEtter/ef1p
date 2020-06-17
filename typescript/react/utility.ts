import { FunctionComponentElement, ReactNode } from 'react';
import { render } from 'react-dom';

/**
 * Declares children to be combined with other properties.
 */
export interface Children {
    children: ReactNode;
}

export function inject(elementId: string, element: FunctionComponentElement<any>) {
    render(element, document.getElementById(elementId));
}
