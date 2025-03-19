/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ComponentType, Fragment, ReactNode } from 'react';

/**
 * Declares the children attribute to be combined with other properties.
 */
export interface Children {
    readonly children: ReactNode;
}

/**
 * Declares the title attribute to be combined with other properties.
 */
export interface Title {
    readonly title: string;
}

/**
 * Declares the className attribute to be combined with other properties.
 */
export interface ClassName {
    readonly className?: string;
}

export interface MinimalVersion {
    /**
     * Declares whether a given tool shall be rendered in a minimal version.
     */
    minimal?: boolean;
}

/**
 * Declares the onClick and onContextMenu attributes to be combined with other properties.
 */
export interface ClickHandler {
    readonly onClick?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
    readonly onContextMenu?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

let keyCounter = 0;
export function getUniqueKey(): number {
    keyCounter += 1
    return keyCounter;
}

export function getDisplayName(component: ComponentType<any>): string {
    return component.displayName || (component as any).name || 'Component';
}

export function join(elements: ReactNode[], separator: ReactNode = ', '): ReactNode {
    if (elements.length > 0) {
        return elements.reduce((accumulator, element) => <Fragment>{accumulator}{separator}{element}</Fragment>);
    } else {
        return '';
    }
}
