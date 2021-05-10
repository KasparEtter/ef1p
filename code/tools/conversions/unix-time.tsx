/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { gregorianFormat, Time } from '../../utility/time';

import { DynamicEntry, ErrorType } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, mergeIntoCurrentState, ProvidedDynamicEntries, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';

/* ------------------------------ Entry updates ------------------------------ */

function convertToGregorianTime(): void {
    const inputs = store.state.inputs;
    inputs.lastInput = 'unixTime';
    let time = Time.fromUnix(inputs.unixTime);
    if (!inputs.utc) {
        time = time.toLocalTime();
    }
    inputs.gregorianTime = time.toGregorianDateWithTime();
}

function onUnixTimeInput(): void {
    convertToGregorianTime();
    store.update('input');
}

async function determineUnixTime(): Promise<[number, ErrorType]> {
    store.state.inputs.unixTime = Time.current().toUnixTime();
    convertToGregorianTime();
    return [store.state.inputs.unixTime, false];
}

function convertToUnixTime(): void {
    const inputs = store.state.inputs;
    inputs.lastInput = 'gregorianTime';
    let time = Time.fromGregorian(inputs.gregorianTime);
    if (!inputs.utc) {
        time = time.toGlobalTime();
    }
    inputs.unixTime = time.toUnixTime();
}

const errorMessage = 'Format: YYYY-MM-DD at HH:MM:SS';

function onGregorianTimeInput(): void {
    if (gregorianFormat.test(store.state.inputs.gregorianTime)) {
        convertToUnixTime();
    } else {
        store.state.errors.gregorianTime = errorMessage;
    }
    store.update('input');
}

async function determineGregorianTime(state: State): Promise<[string, ErrorType]> {
    store.state.inputs.gregorianTime = Time.fromGregorian(state.gregorianTime).floorToDay().toGregorianDateWithTime();
    convertToUnixTime();
    return [store.state.inputs.gregorianTime, false];
}

function onUtcChange(): void {
    if (store.state.inputs.lastInput === 'unixTime') {
        convertToGregorianTime();
    } else {
        convertToUnixTime();
    }
    mergeIntoCurrentState(store);
}

/* ------------------------------ Dynamic entries ------------------------------ */

const unixTime: DynamicEntry<number, State> = {
    name: 'Unix time',
    description: 'The number of seconds since 1970-01-01 at 00:00:00 UTC without leap seconds.',
    defaultValue: () => Time.current().toUnixTime(),
    inputType: 'number',
    labelWidth: 72,
    inputWidth: 130,
    onInput: onUnixTimeInput,
    determine: {
        text: 'Now',
        title: 'Use the current time.',
        onClick: determineUnixTime,
    },
};

const gregorianTime: DynamicEntry<string, State> = {
    name: 'Gregorian time',
    description: 'The time in the familiar Gregorian calendar format: {Year}-{Month}-{Day} at {Hour}:{Minute}:{Second}.',
    defaultValue: Time.current().toGregorianDateWithTime(),
    inputType: 'text',
    labelWidth: 111,
    inputWidth: 200,
    validate: value => !gregorianFormat.test(value) && errorMessage,
    onInput: onGregorianTimeInput,
    determine: {
        text: 'Round',
        title: 'Round down to the start of the day.',
        onClick: determineGregorianTime,
    },
};

const utc: DynamicEntry<boolean, State> = {
    name: 'UTC',
    description: 'Whether the Gregorian time is in UTC or in your local time zone.',
    defaultValue: true,
    inputType: 'switch',
    labelWidth: 36,
    onChange: onUtcChange,
};

const lastInput: DynamicEntry<string, State> = {
    name: 'Last input',
    description: 'This field should never be visible to users.',
    defaultValue: 'unixTime',
    inputType: 'select',
    labelWidth: 74,
    selectOptions: {
        unixTime: 'Unix time',
        gregorianTime: 'Gregorian time',
    },
};

interface State {
    unixTime: number;
    gregorianTime: string;
    utc: boolean;
    lastInput: string;
}

const entries: DynamicEntries<State> = {
    unixTime,
    gregorianTime,
    utc,
    lastInput,
};

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'conversion-unix-time');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);

/* ------------------------------ User interface ------------------------------ */

export const toolConversionUnixTime = <Input entries={{ unixTime, gregorianTime, utc }}/>;
