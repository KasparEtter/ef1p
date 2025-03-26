/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { encodeDomain } from '../../utility/domain';
import { nonEmpty, regex } from '../../utility/string';

import { Argument } from '../../react/argument';
import { CodeBlock } from '../../react/code';
import { ClickToCopy } from '../../react/copy';
import { DynamicBooleanEntry, DynamicEntries, DynamicMultipleSelectEntry, DynamicNumberEntry, DynamicRangeEntry, DynamicSingleSelectEntry, DynamicTextEntry, InputError, validateByTrial } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { getDefaultState, VersionedStore } from '../../react/versioned-store';

import { emailAddressRegexString } from '../protocol/esmtp';

/* ------------------------------ Input ------------------------------ */

const inputWidth = 240;

const minimalOutput: DynamicBooleanEntry<DmarcState> = {
    label: 'Minimal output',
    tooltip: 'Whether to only output the parameters which are different from their default value.',
    defaultValue: true,
    inputType: 'switch',
};

const domainPolicy: DynamicSingleSelectEntry<DmarcState> & Argument<string, DmarcState> = {
    label: 'Domain policy',
    longForm: 'p',
    tooltip: 'What the receiver shall do with messages that fail the authentication or the alignment check.',
    defaultValue: 'reject',
    inputType: 'select',
    selectOptions: {
        none: 'None',
        quarantine: 'Quarantine',
        reject: 'Reject',
    },
};

const subdomainPolicy: DynamicSingleSelectEntry<DmarcState> & Argument<string, DmarcState> = {
    label: 'Subdomain policy',
    longForm: 'sp',
    tooltip: 'The policy which shall be applied to subdomains. Only set this on organizational domains.',
    defaultValue: 'inherit',
    inputType: 'select',
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

const rolloutPercentage: DynamicRangeEntry<DmarcState> & Argument<number, DmarcState> = {
    label: 'Rollout percentage',
    longForm: 'pct',
    tooltip: 'What percentage of unauthentic messages shall be handled according to the previous policies.',
    defaultValue: 100,
    inputType: 'range',
    minValue: 0,
    maxValue: 100,
    skip: (state, value) => noPolicy(state) || state.minimalOutput && value === 100,
    disable: noPolicy,
};

function skipAlignment(state: DmarcState, value: string): boolean {
    return state.minimalOutput && value === 'r';
}

const spfAlignment: DynamicSingleSelectEntry<DmarcState> & Argument<string, DmarcState> = {
    label: 'SPF alignment',
    longForm: 'aspf',
    tooltip: 'Indicate whether strict or relaxed SPF identifier alignment is required. (Relaxed means that only the organizational domains have to match.)',
    defaultValue: 'r',
    inputType: 'select',
    selectOptions: {
        r: 'relaxed',
        s: 'strict',
    },
    skip: skipAlignment,
};

const dkimAlignment: DynamicSingleSelectEntry<DmarcState> & Argument<string, DmarcState> = {
    label: 'DKIM alignment',
    longForm: 'adkim',
    tooltip: 'Indicate whether strict or relaxed DKIM identifier alignment is required. (Relaxed means that only the organizational domains have to match.)',
    defaultValue: 'r',
    inputType: 'select',
    selectOptions: {
        r: 'relaxed',
        s: 'strict',
    },
    skip: skipAlignment,
};

// Support an optional size limit after an exclamation mark
// (see https://datatracker.ietf.org/doc/html/rfc7489#section-6.4):
const dmarcAddressRegexString = `(${emailAddressRegexString}(!\\d+[kmgt]?)?)`;
export const dmarcAddressRegex = regex(dmarcAddressRegexString);

const dmarcAddressesRegexString = `(${dmarcAddressRegexString}(, *${dmarcAddressRegexString})*)?`;
export const dmarcAddressesRegex = regex(dmarcAddressesRegexString);

function validateDmarcAddresses(value: string): InputError {
    return !dmarcAddressesRegex.test(value) && 'Please enter one or more email addresses.';
}

function encodeDmarcAddress(dmarcAddress: string): string {
    const [localPart, domainWithOptionalSizeLimit] = dmarcAddress.trim().split('@');
    const [domain, optionalSizeLimit] = domainWithOptionalSizeLimit.split('!');
    // Encode exclamation marks in the local part of each email address as required by the standard
    // (see https://datatracker.ietf.org/doc/html/rfc7489#section-6.3):
    return 'mailto:' + localPart.replace(/!/g, '%21') + '@' + encodeDomain(domain) + (optionalSizeLimit !== undefined ? '!' + optionalSizeLimit : '');
}

function encodeDmarcAddresses(value: string): string {
    return value.split(',').filter(nonEmpty).map(encodeDmarcAddress).join(',');
}

const aggregateReports: DynamicTextEntry<DmarcState> & Argument<string, DmarcState> = {
    label: 'Aggregate reports',
    longForm: 'rua',
    tooltip: 'A comma-separated list of email addresses to which aggregate feedback is to be sent.',
    defaultValue: '',
    inputType: 'text',
    inputWidth,
    placeholder: 'Email address',
    validateIndependently: validateDmarcAddresses,
    validateDependently: validateByTrial(encodeDmarcAddresses),
    transform: encodeDmarcAddresses,
};

const reportInterval: DynamicNumberEntry<DmarcState> & Argument<number, DmarcState> = {
    label: 'Report interval',
    longForm: 'ri',
    tooltip: 'The desired interval between aggregate reports. In the input in hours, in the output in seconds.',
    defaultValue: 24,
    inputType: 'number',
    inputWidth: inputWidth / 2,
    minValue: 1,
    skip: (state, value) => !state.aggregateReports || state.minimalOutput && value === 24,
    disable: state => !state.aggregateReports,
    transform: value => String(3600 * value),
};

const failureReports: DynamicTextEntry<DmarcState> & Argument<string, DmarcState> = {
    label: 'Failure reports',
    longForm: 'ruf',
    tooltip: 'A comma-separated list of email addresses to which individual failures are to be reported.',
    defaultValue: '',
    inputType: 'text',
    inputWidth,
    placeholder: 'Email address',
    validateIndependently: validateDmarcAddresses,
    validateDependently: validateByTrial(encodeDmarcAddresses),
    transform: encodeDmarcAddresses,
};

const reportFormat: DynamicMultipleSelectEntry<DmarcState> & Argument<string[], DmarcState> = {
    label: 'Report format',
    longForm: 'rf',
    tooltip: 'The format to be used for failure reports. Only a single format has been defined so far.',
    defaultValue: ['afrf'],
    valueSeparator: ':',
    inputType: 'multiple',
    selectOptions: {
        // https://www.iana.org/assignments/dmarc-parameters/dmarc-parameters.xhtml#report-format
        afrf: 'Authentication Failure Reporting Format (AFRF)',
    },
    skip: (state, value) => !state.failureReports || state.minimalOutput && value.length === 1 && value[0] === 'afrf',
    disable: state => !state.failureReports,
    validateIndependently: value => value.length === 0 && 'At least one report format has to be selected.',
};

const reportOptions: DynamicMultipleSelectEntry<DmarcState> & Argument<string[], DmarcState> = {
    label: 'Report when',
    longForm: 'fo',
    tooltip: 'Specify for which events a failure report shall be sent.',
    defaultValue: ['0'],
    valueSeparator: ':',
    inputType: 'multiple',
    selectOptions: {
        '0': 'All authentication mechanisms fail (incl. alignment)',
        '1': 'Any authentication mechanism fails (incl. alignment)',
        'd': 'DKIM signature fails (regardless of alignment)',
        's': 'SPF evaluation fails (regardless of alignment)',
    },
    skip: (state, value) => !state.failureReports || state.minimalOutput && value.length === 1 && value[0] === '0',
    disable: state => !state.failureReports,
    validateIndependently: value => value.length === 0 && 'At least one report option has to be selected.',
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

const store = new VersionedStore(entries, 'format-dmarc');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);

export function getDefaultDmarcState(): DmarcState {
    return getDefaultState(entries);
}

export function setDmarcState(partialNewState: Readonly<Partial<DmarcState>>): void {
    store.setNewStateDirectly(partialNewState);
}

/* ------------------------------ Output ------------------------------ */

const version: Argument<string, DmarcState> = {
    label: 'Version',
    longForm: 'v',
    tooltip: `The version of the DMARC standard.`,
    defaultValue: 'DMARC1',
};

/* ------------------------------ Tool ------------------------------ */

export const toolFormatDmarc: Tool = [
    <Fragment>
        <Input newColumnAt={8}/>
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
    </Fragment>,
    store,
];
