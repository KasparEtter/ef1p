import { removeFromArrayOnce } from '../utility/functions';

export type ValueType = boolean | number | string;

// Please note that a class-based approach does not work
// because the class information is not restored from local storage.

export interface Value<T extends ValueType> {
    value: T; // Models the committed and validated value.
    input: T; // Models the user input, which can be invalid.
    error: string | false; // Explains why the input is invalid.
}

export interface ValueWithHistory<T extends ValueType> extends Value<T> {
    history: T[];
    index: number;
}

export function isValueWithHistory<T extends ValueType>(value: Value<T>): value is ValueWithHistory<T> {
    return (value as ValueWithHistory<T>).index !== undefined;
}

export function newValue<T extends ValueType>(value: T): Value<T> {
    return { value, input: value, error: false };
}

export function newValueWithHistory<T extends ValueType>(value: T): ValueWithHistory<T> {
    return { value, input: value, error: false, history: [value], index: 0 };
}

/**
 * Only call this method with a valid value.
 */
export function setValue<T extends ValueType>(_this: Value<T>, value: T): void {
    _this.value = value;
    _this.input = value;
    if (isValueWithHistory(_this)) {
        removeFromArrayOnce(_this.history, value);
        _this.history.push(value);
        _this.index = _this.history.length - 1;
    }
}

/**
 * Sets the value and input to the previous value.
 * (The value has to be set because the browser will not trigger a change event.)
 */
export function previous<T extends ValueType>(_this: Value<T>): boolean {
    if (isValueWithHistory(_this) && _this.index > 0) {
        _this.index -= 1;
        _this.value = _this.history[_this.index];
        _this.input = _this.value;
        return true;
    } else {
        return false;
    }
}

/**
 * Sets the value and input to the next value.
 * (The value has to be set because the browser will not trigger a change event.)
 */
export function next<T extends ValueType>(_this: Value<T>): boolean {
    if (isValueWithHistory(_this) && _this.index < _this.history.length - 1) {
        _this.index += 1;
        _this.value = _this.history[_this.index];
        _this.input = _this.value;
        return true;
    } else {
        return false;
    }
}

/**
 * Clears the history without affecting the value or the input.
 */
export function clear<T extends ValueType>(_this: Value<T>): boolean {
    if (isValueWithHistory(_this)) {
        _this.history = [_this.value];
        _this.index = 0;
        return true;
    } else {
        return false;
    }
}
