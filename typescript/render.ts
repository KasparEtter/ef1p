import { FunctionComponentElement } from 'react';
import { render } from 'react-dom';

export function inject(elementId: string, element: FunctionComponentElement<any>) {
    render(element, document.getElementById(elementId));
}
