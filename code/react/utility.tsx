import { Fragment, FunctionComponentElement, ReactNode } from 'react';
import { render } from 'react-dom';

/**
 * Declares the children attribute to be combined with other properties.
 */
export interface Children {
    children: ReactNode;
}

/**
 * Declares the title attribute to be combined with other properties.
 */
export interface Title {
    title: string;
}

/**
 * Declares the className attribute to be combined with other properties.
 */
export interface ClassName {
    className?: string;
}

/**
 * Declares the onClick and onContextMenu attributes to be combined with other properties.
 */
export interface ClickHandler {
    onClick?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
    onContextMenu?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
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
