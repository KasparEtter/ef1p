/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { EventHandler } from './types';

export function bind(elementId: string, event: keyof GlobalEventHandlersEventMap, callback: EventHandler): void {
    document.getElementById(elementId)!.addEventListener(event, callback);
}
