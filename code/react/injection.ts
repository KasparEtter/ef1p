/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { FunctionComponentElement } from 'react';
import { createRoot } from 'react-dom/client';

import { VersionedStore } from './versioned-store';

function getElementByIdOrLogError(id: string): HTMLElement | null {
    const element = document.getElementById(id);
    if (element === null) {
        console.error(`There exists no container with the ID '${id}'.`);
    }
    return element;
}

export function moveElement(sourceId: string, targetId: string): void {
    getElementByIdOrLogError(targetId)?.appendChild(getElementByIdOrLogError(sourceId)!);
}

export function injectElement(containerId: string, element: FunctionComponentElement<any>): void {
    const container = getElementByIdOrLogError(containerId);
    if (container !== null) {
        const root = createRoot(container);
        root.render(element);
    }
}

type StoreAndSubmit = [VersionedStore<any>] | [VersionedStore<any>, (state: any) => any];
export type Tool = [FunctionComponentElement<any>, ...StoreAndSubmit];

const tools: { [key: string]: StoreAndSubmit | undefined } = {};

export function injectTool(containerId: string, tool: Tool): void {
    tools[containerId] = [tool[1], tool[2]!]; // The exclamation mark is wrong, but it makes TypeScript happy.
    injectElement(containerId, tool[0]);
}

declare global {
    var submitAllTools: () => void;
    var handleToolUpdate: (parts: string[], verifyOnly?: boolean) => boolean;
}

window.submitAllTools = () => {
    for (const tool of Object.values(tools)) {
        if (tool !== undefined && tool[1] !== undefined) {
            tool[1](tool[0].getCurrentState());
        }
    }
}

window.handleToolUpdate = (parts: string[], verifyOnly = false) => {
    const elementId = parts[0].slice(1);
    const tool = tools[elementId];
    if (tool !== undefined) {
        return tool[0].decodeInputs(parts.slice(1), tool[1], verifyOnly);
    } else {
        console.error(`Could not find the tool '${elementId}'.`);
        return false;
    }
}
