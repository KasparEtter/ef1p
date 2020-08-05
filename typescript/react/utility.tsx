import { createElement, Fragment, FunctionComponentElement, ReactNode } from 'react';
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

export function join(elements: JSX.Element[], separator: JSX.Element = <Fragment> </Fragment>): JSX.Element {
    if (elements.length > 0) {
        return elements.reduce((accumulator, element) => <Fragment>{accumulator}{separator}{element}</Fragment>);
    } else {
        return <Fragment></Fragment>;
    }
}

export function inject(elementId: string, element: FunctionComponentElement<any>): void {
    render(element, document.getElementById(elementId));
}

export type Callback = () => any;

export function bind(elementId: string, event: keyof GlobalEventHandlers, callback: Callback): void {
    // @ts-ignore The expression produces a union type that is too complex to represent.
    document.getElementById(elementId)![event] = callback;
}
