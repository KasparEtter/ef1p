/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { NotArray, NotFunction, OptionalReturnValues2, OptionalReturnValues3, ValueOrArray, ValueOrFunction } from './types';

export function normalizeToValue<T extends NotFunction | undefined, I = undefined>(argument: ValueOrFunction<T, I>, input: I): T {
    return typeof argument === 'function' ? argument(input) : argument;
}

export function normalizeToArray<T>(argument?: ValueOrArray<T>): T[] {
    if (argument === undefined) {
        return [];
    } else {
        return Array.isArray(argument) ? argument : [ argument ] as T[];
    }
}

export function normalizeReturnValues2<T1 extends NotArray, T2>(optionalReturnValues: OptionalReturnValues2<T1, T2>): [T1 | undefined, T2 | undefined] {
    if (Array.isArray(optionalReturnValues)) {
        return optionalReturnValues;
    } else {
        return [optionalReturnValues, undefined];
    }
}

export function normalizeReturnValues3<T1 extends NotArray, T2, T3>(optionalReturnValues: OptionalReturnValues3<T1, T2, T3>): [T1 | undefined, T2 | undefined, T3 | undefined] {
    if (Array.isArray(optionalReturnValues)) {
        return [optionalReturnValues[0], optionalReturnValues[1], optionalReturnValues[2]];
    } else {
        return [optionalReturnValues, undefined, undefined];
    }
}
