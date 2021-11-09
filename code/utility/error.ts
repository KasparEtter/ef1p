/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'An unknown problem occurred.';
}
