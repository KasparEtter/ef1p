/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { Argument, DynamicArgument } from '../../react/argument';
import { CodeBlock } from '../../react/code';
import { ClickToCopy } from '../../react/copy';
import { DynamicEntry, ErrorType } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { OutputEntriesProps, RawOutputEntries } from '../../react/output-entries';
import { shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultState, getDefaultVersionedState, ProvidedDynamicEntries, ProvidedEntries, setState, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';

import { emailAddressRegexString, regex } from '../protocols/esmtp';

/* ------------------------------ Dynamic entries ------------------------------ */

const inputWidth = 240;

const minimalOutput: DynamicEntry<boolean, DmarcState> = {
    name: 'Minimal output',
    description: 'Whether to only output the parameters which are different from their default value.',
    defaultValue: true,
    inputType: 'switch',
    labelWidth: 113,
};

const domainPolicy: DynamicArgument<string, DmarcState> = {
    name: 'Domain policy',
    longForm: 'p',
    description: 'What the receiver shall do with messages that fail the authentication or the alignment check.',
    defaultValue: 'reject',
    inputType: 'select',
    labelWidth: 105,
    selectOptions: {
        none: 'None',
        quarantine: 'Quarantine',
        reject: 'Reject',
    },
};

const subdomainPolicy: DynamicArgument<string, DmarcState> = {
    name: 'Subdomain policy',
    longForm: 'sp',
    description: 'The policy which shall be applied to subdomains. Only set this on organizational domains.',
    defaultValue: 'inherit',
    inputType: 'select',
    labelWidth: 128,
    selectOptions: {
        inherit: 'Inherit',
        none: 'None',
        quarantine: 'Quarantine',
        reject: 'Reject',
    },
    skip: (state, value) => value === 'inherit' || value === state.domainPolicy,
};

function noPolicy(state: DmarcState): boolean {
    return state.domainPolicy === 'none' && (['inherit', 'none'].includes(state.subdomainPolicy));
}

const rolloutPercentage: DynamicArgument<number, DmarcState> = {
    name: 'Rollout percentage',
    longForm: 'pct',
    description: 'What percentage of unauthentic messages shall be handled according to the previous policies.',
    defaultValue: 100,
    inputType: 'range',
    minValue: 0,
    maxValue: 100,
    stepValue: 1,
    labelWidth: 138,
    skip: (state, value) => noPolicy(state) || state.minimalOutput && value === 100,
    disable: noPolicy,
};

function skipAlignment(state: DmarcState, value: string): boolean {
    return state.minimalOutput && value === 'r';
}

const spfAlignment: DynamicArgument<string, DmarcState> = {
    name: 'SPF alignment',
    longForm: 'aspf',
    description: 'Indicate whether strict or relaxed SPF identifier alignment is required. (Relaxed means that only the organizational domains have to match.)',
    defaultValue: 'r',
    inputType: 'select',
    labelWidth: 105,
    selectOptions: {
        r: 'relaxed',
        s: 'strict',
    },
    skip: skipAlignment,
};

const dkimAlignment: DynamicArgument<string, DmarcState> = {
    name: 'DKIM alignment',
    longForm: 'adkim',
    description: 'Indicate whether strict or relaxed DKIM identifier alignment is required. (Relaxed means that only the organizational domains have to match.)',
    defaultValue: 'r',
    inputType: 'select',
    labelWidth: 120,
    selectOptions: {
        r: 'relaxed',
        s: 'strict',
    },
    skip: skipAlignment,
};

const dmarcAddressRegexString = `(${emailAddressRegexString}(!\\d+[kmgt]?)?)`;
export const dmarcAddressRegex = regex(dmarcAddressRegexString);

const dmarcAddressesRegexString = `(${dmarcAddressRegexString}(, *${dmarcAddressRegexString})*)?`;
export const dmarcAddressesRegex = regex(dmarcAddressesRegexString);

function validateAddresses(value: string): ErrorType {
    return !dmarcAddressesRegex.test(value) && 'Please enter one or more email addresses.';
}

function transformAddresses(value: string): string {
    return value.split(',').map(address => 'mailto:' + address.trim().split('@').map((value, index) => index === 0 ? value.replace(/!/g, '%21') : value).join('@')).join(',');
}

const aggregateReports: DynamicArgument<string, DmarcState> = {
    name: 'Aggregate reports',
    longForm: 'rua',
    description: 'A comma-separated list of email addresses to which aggregate feedback is to be sent.',
    defaultValue: '',
    inputType: 'text',
    labelWidth: 133,
    inputWidth,
    placeholder: 'Email address',
    validate: validateAddresses,
    transform: transformAddresses,
};

const reportInterval: DynamicArgument<number, DmarcState> = {
    name: 'Report interval',
    longForm: 'ri',
    description: 'The desired interval between aggregate reports. In the input in hours, in the output in seconds.',
    defaultValue: 24,
    inputType: 'number',
    labelWidth: 111,
    inputWidth: inputWidth / 2,
    minValue: 1,
    stepValue: 1,
    skip: (state, value) => !state.aggregateReports || state.minimalOutput && value === 24,
    disable: state => !state.aggregateReports,
    validate: value => value < 1 && 'The value has to be at least 1.',
    transform: value => String(3600 * value),
};

const failureReports: DynamicArgument<string, DmarcState> = {
    name: 'Failure reports',
    longForm: 'ruf',
    description: 'A comma-separated list of email addresses to which individual failures are to be reported.',
    defaultValue: '',
    inputType: 'text',
    labelWidth: 109,
    inputWidth,
    placeholder: 'Email address',
    validate: validateAddresses,
    transform: transformAddresses,
};

const reportFormat: DynamicArgument<string[], DmarcState> = {
    name: 'Report format',
    longForm: 'rf',
    description: 'The format to be used for failure reports. Only a single format has been defined so far.',
    defaultValue: ['afrf'],
    valueSeparator: ':',
    inputType: 'multiple',
    labelWidth: 105,
    selectOptions: {
        // https://www.iana.org/assignments/dmarc-parameters/dmarc-parameters.xhtml#report-format
        afrf: 'Authentication Failure Reporting Format (AFRF)',
    },
    skip: (state, value) => !state.failureReports || state.minimalOutput && value.length === 1 && value[0] === 'afrf',
    validate: value => value.length === 0 && 'At least one report format has to be selected.',
    disable: state => !state.failureReports,
};

const reportOptions: DynamicArgument<string[], DmarcState> = {
    name: 'Report when',
    longForm: 'fo',
    description: 'Specify for which events a failure report shall be sent.',
    defaultValue: ['0'],
    valueSeparator: ':',
    inputType: 'multiple',
    labelWidth: 95,
    selectOptions: {
        '0': 'All authentication mechanisms fail (incl. alignment)',
        '1': 'Any authentication mechanism fails (incl. alignment)',
        'd': 'DKIM signature fails (regardless of alignment)',
        's': 'SPF evaluation fails (regardless of alignment)',
    },
    skip: (state, value) => !state.failureReports || state.minimalOutput && value.length === 1 && value[0] === '0',
    validate: value => value.length === 0 && 'At least one report option has to be selected.',
    disable: state => !state.failureReports,
};

export interface DmarcState {
    minimalOutput: boolean;
    domainPolicy: string;
    subdomainPolicy: string;
    rolloutPercentage: number;
    spfAlignment: string;
    dkimAlignment: string;
    aggregateReports: string;
    reportInterval: number;
    failureReports: string;
    reportFormat: string;
    reportOptions: string[];
}

const entries: DynamicEntries<DmarcState> = {
    minimalOutput,
    domainPolicy,
    subdomainPolicy,
    rolloutPercentage,
    spfAlignment,
    dkimAlignment,
    aggregateReports,
    reportInterval,
    failureReports,
    reportFormat,
    reportOptions,
};

const store = new PersistedStore<VersionedState<DmarcState>, AllEntries<DmarcState>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'format-dmarc');
const Input = shareStore<VersionedState<DmarcState>, ProvidedDynamicEntries<DmarcState> & InputProps<DmarcState>, AllEntries<DmarcState>, VersioningEvent>(store, 'input')(RawInput);
const OutputEntries = shareStore<VersionedState<DmarcState>, ProvidedEntries & OutputEntriesProps, AllEntries<DmarcState>, VersioningEvent>(store, 'state')(RawOutputEntries);

export function getDefaultDmarcState(): DmarcState {
    return getDefaultState(entries);
}

export function setDmarcState(partialNewState: Partial<DmarcState>): void {
    setState(store, partialNewState);
}

/* ------------------------------ Static entries ------------------------------ */

const version: Argument<string, DmarcState> = {
    name: 'Version',
    longForm: 'v',
    description: `The version of the DMARC standard.`,
    defaultValue: 'DMARC1',
};

/* ------------------------------ User interface ------------------------------ */

export const toolFormatDmarc = <Fragment>
    <Input entries={entries} newColumnAt={8}/>
    <CodeBlock wrapped>
        <ClickToCopy>
            <OutputEntries entries={{
                    version,
                    domainPolicy,
                    subdomainPolicy,
                    rolloutPercentage,
                    spfAlignment,
                    dkimAlignment,
                    aggregateReports,
                    reportInterval,
                    failureReports,
                    reportFormat,
                    reportOptions,
                }}
                outputSeparator={'; '}
                argumentSeparator={'='}
            />
        </ClickToCopy>
    </CodeBlock>
</Fragment>;
