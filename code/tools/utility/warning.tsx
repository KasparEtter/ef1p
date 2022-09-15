/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

export function getWarningSymbol(title?: string): JSX.Element {
    return <span className="warning-symbol" title={title}>⚠️</span>;
}

export const warningSymbol = getWarningSymbol();
