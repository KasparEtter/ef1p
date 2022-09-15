/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { filterUndefined } from '../../utility/array';
import { copyToClipboard } from '../../utility/clipboard';
import { toHex } from '../../utility/string';

import { DynamicOutput } from '../../react/code';
import { DynamicEntries, DynamicSingleSelectEntry, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const input: DynamicTextEntry<State> = {
    label: 'Input',
    tooltip: 'The input that you want to normalize.',
    defaultValue: 'Café',
    inputType: 'text',
    inputWidth: 280,
};

const normalizations = {
    none: `None (depends on your system)`,
    NFC: 'Canonical composition (NFC)',
    NFD: 'Canonical decomposition (NFD)',
    NFKC: 'Compatibility composition (NFKC)',
    NFKD: 'Compatibility decomposition (NFKD)',
};

const normalization: DynamicSingleSelectEntry<State> = {
    label: 'Normalization',
    tooltip: 'The form to which you want to normalize the input.',
    defaultValue: 'none',
    inputType: 'select',
    selectOptions: normalizations,
};

interface State {
    input: string;
    normalization: string;
}

const entries: DynamicEntries<State> = {
    input,
    normalization,
};

const store = new VersionedStore(entries, 'encoding-normalization');
const Input = getInput(store);

/* ------------------------------ Output ------------------------------ */

function renderCodePoint(point: number): ReactNode {
    switch (point) {
        case 0x8:
            return <small>BSP</small>;
        case 0x9:
            return <small>TAB</small>;
        case 0xA:
            return <small>LF</small>;
        case 0xD:
            return <small>CR</small>;
        case 0x20:
            return <small>SPACE</small>;
        case 0xA0:
            return <small>NBSP</small>;
        case 0x200B:
            return <small>ZWSP</small>;
        case 0x200C:
            return <small>ZWNJ</small>;
        case 0x200D:
            return <small>ZWJ</small>;
        case 0xFE0F:
            return <small>EMOJI</small>;
        default:
            const result = String.fromCodePoint(point);
            return /^\p{Mark}$/u.test(result) ? '◌' + result : result;
    }
}

function escapeNonAscii(points: number[]): string {
    let result = '';
    for (const point of points) {
        if (point < 32 || point > 126) {
            if (point <= 0xFF) {
                result += '\\x' + toHex(point, 2);
            } else if (point <= 0xFFFF) {
                result += '\\u' + toHex(point, 4);
            } else {
                result += '\\u{' + toHex(point, 4) + '}';
            }
        } else {
            result += String.fromCodePoint(point);
        }
    }
    return result;
}

function RawNormalizationOutput({ input, normalization }: State): JSX.Element {
    const parsed = input.replace(/\\u\{([0-9A-Fa-f]{1,6})\}|\\u([0-9A-Fa-f]{4})|\\x([0-9A-Fa-f]{2})/g, (_, g1, g2, g3) => {
        const hex = g1 ?? g2 ?? g3;
        if (hex === undefined) {
            throw new Error('At least one capturing group should be defined.');
        }
        return String.fromCodePoint(Number.parseInt(hex, 16));
    });
    const normalized = normalization !== 'none' ? parsed.normalize(normalization) : parsed;
    const points = filterUndefined(Array.from(normalized, char => char.codePointAt(0)));
    return <p className="dynamic-output-pointer">
        <span className="d-inline-block align-middle" style={{ height: 44 }}></span>
        <span className="mr-1 align-middle">Output:</span>
        {points.map(point =>
            <DynamicOutput
                className="d-inline-block ml-1 align-middle text-center"
                title="Click to look up this code point in a new window."
                onClick={() => window.open(`https://unicode-table.com/en/${toHex(point, 4)}/`, '_blank')}
            >
                <div>{renderCodePoint(point)}</div>
                <div className="small color-gray">{toHex(point)}</div>
            </DynamicOutput>,
        )}
        {
            points.length !== 0 &&
            <Fragment>
                <button
                    type="button"
                    className="btn btn-sm btn-primary ml-3 align-middle"
                    onClick={() => copyToClipboard(normalized)}
                    title="Copy the normalized string to your clipboard."
                >Copy the normalized string</button>
                <button
                    type="button"
                    className="btn btn-sm btn-primary ml-3 align-middle"
                    onClick={() => copyToClipboard(escapeNonAscii(points))}
                    title="Copy the normalized string to your clipboard."
                >Copy the code points</button>
            </Fragment>
        }
    </p>;
}

const NormalizationOutput = store.injectInputs(RawNormalizationOutput);

/* ------------------------------ Tool ------------------------------ */

export const toolEncodingNormalization: Tool = [
    <Fragment>
        <Input/>
        <NormalizationOutput/>
    </Fragment>,
    store,
];
