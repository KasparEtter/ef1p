/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { gregorianFormat, Time } from '../../utility/time';

import { DynamicBooleanEntry, DynamicEntries, DynamicNumberEntry, DynamicSingleSelectEntry, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const unixTime: DynamicNumberEntry<State> = {
    label: 'Unix time',
    tooltip: 'The number of seconds since 1970-01-01 at 00:00:00 UTC without leap seconds.',
    defaultValue: Time.current().toUnixTime(),
    inputType: 'number',
    inputWidth: 130,
    updateOtherInputsOnInput: (input, inputs) => ({ lastInput: 'unixTime', gregorianTime: Time.fromUnix(input).toLocalTime(!inputs.utc).toGregorianDateWithTime() }),
    determine: {
        label: 'Now',
        tooltip: 'Use the current time.',
        onClick: async () => Time.current().toUnixTime(),
    },
};

const gregorianTime: DynamicTextEntry<State> = {
    label: 'Gregorian time',
    tooltip: 'The time in the familiar Gregorian calendar format: {Year}-{Month}-{Day} at {Hour}:{Minute}:{Second}.',
    defaultValue: Time.current().toGregorianDateWithTime(),
    inputType: 'text',
    inputWidth: 200,
    validateIndependently: input => !gregorianFormat.test(input) && 'Format: YYYY-MM-DD at HH:MM:SS',
    updateOtherInputsOnInput: (input, inputs) => ({ lastInput: 'gregorianTime', unixTime: Time.fromGregorian(input).toGlobalTime(!inputs.utc).toUnixTime() }),
    determine: {
        label: 'Round',
        tooltip: 'Round down to the start of the day.',
        requireIndependentlyValidInput: true,
        onClick: async input => Time.fromGregorian(input).floorToDay().toGregorianDateWithTime(),
    },
};

const utc: DynamicBooleanEntry<State> = {
    label: 'UTC',
    tooltip: 'Whether the Gregorian time is in UTC or in your local time zone.',
    defaultValue: true,
    inputType: 'switch',
    triggerOtherInputOnInput: inputs => inputs.lastInput === 'unixTime' ? 'unixTime' : 'gregorianTime',
};

const lastInput: DynamicSingleSelectEntry<State> = {
    label: 'Last input',
    tooltip: 'This field should never be visible to users.',
    defaultValue: 'unixTime',
    inputType: 'select',
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

const store = new VersionedStore(entries, 'conversion-unix-time');
const Input = getInput(store);

/* ------------------------------ Tool ------------------------------ */

export const toolConversionUnixTime: Tool = [<Input entries={{ unixTime, gregorianTime, utc }}/>, store];
