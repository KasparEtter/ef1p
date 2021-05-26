/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import createHash from 'create-hash';
import { Fragment } from 'react';
import { Buffer } from 'safe-buffer';

import { download } from '../../utility/download';

import { DynamicEntry } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { OutputEntriesProps, RawOutputEntries } from '../../react/output-entries';
import { shareState, shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, ProvidedDynamicEntries, ProvidedEntries, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore, Store } from '../../react/store';

import { getDefaultRecordState, makeQuery, RawRecordOutput, RecordState } from './email-domain';

/* ------------------------------ Utility functions ------------------------------ */

function splitAndHash(emailAddress: string): [string, string] {
    const [localPart, domain] = emailAddress.split('@');
    const hash = createHash('sha256').update(localPart.normalize('NFC')).digest('hex').substring(0, 56);
    return [hash, domain];
}

/* ------------------------------ SMIMEA records ------------------------------ */

const smimeaRecordsStore = new Store<RecordState>(getDefaultRecordState(), undefined);
const SmimeaRecordsOutput = shareState<RecordState>(smimeaRecordsStore)(RawRecordOutput);

async function querySmimeaRecords({ emailAddress }: State): Promise<void> {
    smimeaRecordsStore.setState(getDefaultRecordState());
    try {
        const [hash, domain] = splitAndHash(emailAddress);
        const query = await makeQuery(hash + '._smimecert.' + domain, 'https://datatracker.ietf.org/doc/html/rfc8162#section-6', 'SMIMEA');
        if (query.records.length === 0) {
            query.remarks.push({
                type: 'info',
                text: 'This domain has no SMIMEA records.',
            });
        }
        smimeaRecordsStore.state.queries.push(query);
        for (const record of query.records) {
            if (!/^\\# \d+ [0-9a-f]{7,}$/.test(record.content)) {
                record.remarks.push({
                    type: 'error',
                    text: 'Could not parse this SMIMEA record.',
                });
            } else {
                const hex = record.content.split(' ')[2];
                const certificateUsage = Number.parseInt(hex.substring(0, 2), 16);
                const selector = Number.parseInt(hex.substring(2, 4), 16);
                const matchingType = Number.parseInt(hex.substring(4, 6), 16);
                const certificateAssociationData = hex.substring(6);
                record.content = [
                    certificateUsage.toString(),
                    selector.toString(),
                    matchingType.toString(),
                    certificateAssociationData,
                ].join(' ');
                if (certificateUsage > 3) {
                    record.remarks.push({
                        type: 'error',
                        text: 'The certificate usage has to be smaller than 4.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc6698#section-2.1.1',
                    });
                }
                if (selector > 1) {
                    record.remarks.push({
                        type: 'error',
                        text: 'The selector has to be smaller than 2.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc6698#section-2.1.2',
                    });
                }
                if (matchingType > 2) {
                    record.remarks.push({
                        type: 'error',
                        text: 'The matching type has to be smaller than 3.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc6698#section-2.1.3',
                    });
                }
                if (matchingType === 1 && certificateAssociationData.length !== 64 || matchingType === 2 && certificateAssociationData.length !== 128) {
                    record.remarks.push({
                        type: 'error',
                        text: 'The certificate association data is not of the expected length.',
                        link: 'https://datatracker.ietf.org/doc/html/rfc6698#section-2.1.4',
                    });
                }
            }
        }
        smimeaRecordsStore.update();
    } catch (error) {
        smimeaRecordsStore.setState({ ...getDefaultRecordState(), error: error.message });
    }
}

/* ------------------------------ OPENPGPKEY records ------------------------------ */

const openpgpkeyRecordsStore = new Store<RecordState>(getDefaultRecordState(), undefined);
const OpenpgpkeyRecordsOutput = shareState<RecordState>(openpgpkeyRecordsStore)(RawRecordOutput);

// tslint:disable:no-bitwise
// https://datatracker.ietf.org/doc/html/rfc4880#section-6.1
function crc24(buffer: Buffer): string {
    let result = 0xB704CE;
    for (let i = 0; i < buffer.length; i++) {
        result ^= buffer.readInt8(i) << 16;
        for (let j = 0; j < 8; j++) {
            result <<= 1;
            if (result & 0x1000000) {
                result ^= 0x1864CFB;
            }
        }
    }
    return Buffer.from([(result & 0xFF0000) >> 16, (result & 0xFF00) >> 8, result & 0xFF]).toString('base64');
}
// tslint:enable:no-bitwise

function getPublicKeyBlock(buffer: Buffer): string {
    return '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n' +
        buffer.toString('base64').replace(/(.{64})/g, '$1\n') +
        (buffer.length % 48 !== 0 ? '\n' : '') +
        '=' + crc24(buffer) +
        '\n-----END PGP PUBLIC KEY BLOCK-----\n';
}

async function queryOpenpgpkeyRecords({ emailAddress }: State): Promise<void> {
    openpgpkeyRecordsStore.setState(getDefaultRecordState());
    try {
        const [hash, domain] = splitAndHash(emailAddress);
        const query = await makeQuery(hash + '._openpgpkey.' + domain, 'https://datatracker.ietf.org/doc/html/rfc7929#section-5', 'OPENPGPKEY');
        if (query.records.length === 0) {
            query.remarks.push({
                type: 'info',
                text: 'This domain has no OPENPGPKEY records.',
            });
        }
        openpgpkeyRecordsStore.state.queries.push(query);
        for (const record of query.records) {
            if (!/^\\# \d+ [0-9a-f]+$/.test(record.content)) {
                record.remarks.push({
                    type: 'error',
                    text: 'Could not parse this OPENPGPKEY record.',
                });
            } else {
                const buffer = Buffer.from(record.content.split(' ')[2], 'hex');
                const result = getPublicKeyBlock(buffer);
                record.content = result;
                record.remarks.push({
                    type: 'warning',
                    text: 'This tool does not perform DNSSEC authentication. You must still verify this key with the recipient out-of-band.',
                    link: 'https://datatracker.ietf.org/doc/html/rfc7929#section-7',
                });
                record.buttons.push({
                    text: 'Download this key',
                    title: `Download the OpenPGP public key of ${emailAddress}.`,
                    onClick: () => download(emailAddress + '.asc', result),
                });
            }
        }
        openpgpkeyRecordsStore.update();
    } catch (error) {
        openpgpkeyRecordsStore.setState({ ...getDefaultRecordState(), error: error.message });
    }
}

/* ------------------------------ Dynamic entries ------------------------------ */

const addressRegex = /^[^@ ]+@([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*[a-z][-a-z0-9]{0,61}[a-z0-9]$/i;

const emailAddress: DynamicEntry<string> = {
    name: 'Email address',
    description: 'The email address you want to query.',
    defaultValue: 'security@ef1p.com',
    inputType: 'text',
    labelWidth: 102,
    inputWidth: 270,
    validate: value =>
        value === '' && 'The email address may not be empty.' ||
        value.includes(' ') && 'The email address may not contain spaces.' || // Redundant to the regular expression, just a more specific error message.
        !addressRegex.test(value) && 'The pattern of the email address is invalid.',
};

interface State {
    emailAddress: string;
}

const entries: DynamicEntries<State> = {
    emailAddress,
};

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'lookup-email-address');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);
const OutputEntries = shareStore<VersionedState<State>, ProvidedEntries & OutputEntriesProps, AllEntries<State>, VersioningEvent>(store, 'state')(RawOutputEntries);

/* ------------------------------ User interface ------------------------------ */

export const toolLookupSmimeaRecords = <Fragment>
    <Input entries={entries} submit={{ text: 'Query', title: 'Query the SMIMEA records of the given email address.', onClick: querySmimeaRecords }}/>
    <SmimeaRecordsOutput/>
</Fragment>;

export const toolLookupOpenpgpkeyRecords = <Fragment>
    <Input entries={entries} submit={{ text: 'Query', title: 'Query the OPENPGPKEY records of the given email address.', onClick: queryOpenpgpkeyRecords }}/>
    <OpenpgpkeyRecordsOutput/>
</Fragment>;

export const emailAddressOutput = <OutputEntries entries={{ emailAddress }}/>;
