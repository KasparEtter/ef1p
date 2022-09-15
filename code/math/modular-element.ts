/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

// Introduced to make the coloring of cells in operation and repetition tables simpler.
// This interface is implemented by `ModularElement` and `RingElement`.
export interface ModularElement {
    isZero(): boolean;
    isOne(): boolean;
    isCoprimeWithModulus(): boolean;
}
