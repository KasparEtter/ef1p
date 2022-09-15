/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    } else if (error instanceof Error) {
        return error.message;
    } else {
        return 'An unknown problem occurred.';
    }
}
