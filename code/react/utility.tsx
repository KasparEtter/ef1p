/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ComponentType, Fragment, FunctionComponentElement, ReactNode } from 'react';
import { render } from 'react-dom';

import { AllEntries, decodeInputs, VersionedState, VersioningEvent } from './state';
import { Store } from './store';

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

export function getDisplayName(component: ComponentType<any>): string {
    return component.displayName || (component as any).name || 'Component';
}

export function join(elements: JSX.Element[], separator: JSX.Element = <Fragment> </Fragment>): JSX.Element {
    if (elements.length > 0) {
        return elements.reduce((accumulator, element) => <Fragment>{accumulator}{separator}{element}</Fragment>);
    } else {
        return <Fragment></Fragment>;
    }
}

export function injectElement(elementId: string, element: FunctionComponentElement<any>): void {
    render(element, document.getElementById(elementId));
}

type StoreAndSubmit = [Store<VersionedState<any>, AllEntries<any>, VersioningEvent>] | [Store<VersionedState<any>, AllEntries<any>, VersioningEvent>, (state: any) => any];
export type Tool = [FunctionComponentElement<any>, ...StoreAndSubmit];

const tools: { [key: string]: StoreAndSubmit | undefined } = {};

export function injectTool(elementId: string, tool: Tool): void {
    tools[elementId] = [tool[1], tool[2]!]; // The exclamation mark is wrong, but it makes TypeScript happy.
    injectElement(elementId, tool[0]);
}

declare global {
    var handleToolUpdate: (parts: string[]) => void;
}

window.handleToolUpdate = (parts: string[]) => {
    const elementId = parts[0].slice(1);
    const tool = tools[elementId];
    if (tool !== undefined) {
        decodeInputs(tool[0], parts.slice(1), tool[1]);
    } else {
        console.error(`Could not find the tool '${elementId}'.`);
    }
}
