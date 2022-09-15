/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Ring, RingElement } from './ring';

export function matrixToString<R extends Ring<R, E>, E extends RingElement<R, E>>(matrix: E[][]): string {
    return matrix.map(row => row.map(element => element.toString()).join(', ')).join('\n');
}

export function vectorToString<R extends Ring<R, E>, E extends RingElement<R, E>>(vector: E[]): string {
    return vector.map(element => element.toString()).join('\n');
}

/**
 * Solves the system of linear equations without affecting the matrix and the vector.
 * The function throws an error if the matrix is singular and thus not invertible.
 * @param matrix A matrix of the form matrix[row][column]. Unneeded rows are ignored.
 * @param vector The right-hand side of the linear equations.
 * @param debugging Update the matrix at positions that won't be used again.
 * @param abort Abort after checking that the matrix is invertible.
 * @returns The solution to the system of linear equations.
 */
export function solveLinearEquations<R extends Ring<R, E>, E extends RingElement<R, E>>(
    matrix: E[][],
    vector: E[],
    debugging = 0,
    abort = false,
): E[] {
    const lengthY = vector.length;
    if (lengthY === 0) {
        throw new Error('guassian-elimination.ts: The length of the vector may not be zero.');
    }
    if (matrix.length !== lengthY) {
        throw new Error('guassian-elimination.ts: The matrix must have the same length as the vector.');
    }
    const lengthX = matrix[0].length;
    if (lengthY < lengthX) {
        throw new Error('guassian-elimination.ts: The system of linear equations is underdetermined.');
    }
    if (matrix.some(row => row.length !== lengthX)) {
        throw new Error('guassian-elimination.ts: All rows of the matrix have to be of the same length.');
    }
    // Create copies of the matrix and the vector.
    matrix = matrix.map(vector => vector.slice());
    vector = vector.slice();
    if (debugging >= 2) {
        console.log('The initial matrix:');
        console.log(matrixToString(matrix));
    }
    // Bring the matrix into row echelon form where all leading coefficients are one.
    for (let i = 0; i < lengthX; i++) {
        // Make sure that the current pivot element is invertible by swapping rows if necessary.
        if (!matrix[i][i].isInvertible()) {
            for (let row = i + 1; row < lengthY; row++) {
                if (matrix[row][i].isInvertible()) {
                    const elements = matrix[i];
                    const element = vector[i];
                    matrix[i] = matrix[row];
                    vector[i] = vector[row];
                    matrix[row] = elements;
                    vector[row] = element;
                    break;
                }
            }
        }
        if (!matrix[i][i].isInvertible()) {
            if (debugging >= 1) {
                console.log(`Could not find an invertible pivot element for column ${i}:`);
                console.log(matrixToString(matrix));
            }
            throw new Error('guassian-elimination.ts: Could not find an invertible pivot element.');
        }
        // Multiply the current row by the inverse of the pivot element to make the pivot one.
        const inverse = matrix[i][i].invertMultiplicatively();
        for (let column = debugging ? i : i + 1; column < lengthX; column++) {
            matrix[i][column] = matrix[i][column].multiply(inverse);
        }
        vector[i] = vector[i].multiply(inverse);
        // Subtract the current row from the rows below to make the elements zero in the pivot column.
        for (let row = i + 1; row < lengthY; row++) {
            const element = matrix[row][i];
            if (!element.isZero()) {
                for (let column = debugging ? i : i + 1; column < lengthX; column++) {
                    matrix[row][column] = matrix[row][column].subtract(element.multiply(matrix[i][column]));
                }
                vector[row] = vector[row].subtract(element.multiply(vector[i]));
            }
        }
        if (debugging >= 2) {
            console.log(`Row echelon form up to column ${i}:`);
            console.log(matrixToString(matrix));
        }
    }
    if (abort) {
        return [];
    }
    // Bring the matrix into reduced row echelon form, where all elements not on the diagonal are zero.
    for (let i = lengthX - 1; i > 0; i--) { // While i > 0 because the first column needs no reduction.
        for (let row = i - 1; row >= 0; row--) {
            const element = matrix[row][i];
            if (!element.isZero()) {
                if (debugging) {
                    matrix[row][i] = vector[0].ring.zero;
                }
                vector[row] = vector[row].subtract(element.multiply(vector[i]));
            }
        }
        if (debugging >= 3) {
            console.log(`Reduced row echelon form up to column ${i}:`);
            console.log(matrixToString(matrix));
        }
    }
    // Since the matrix is now an identity matrix, we can return the vector as the solution.
    return vector.slice(0, lengthX);
}

export function isMatrixInvertible<R extends Ring<R, E>, E extends RingElement<R, E>>(
    matrix: E[][],
    debugging = 0,
): boolean {
    try {
        const zero = matrix[0][0].ring.zero;
        const vector = matrix.map(row => zero);
        solveLinearEquations(matrix, vector, debugging, true);
        return true;
    } catch (error) {
        return false;
    }
}
