import { Fragment, ReactNode } from 'react';

import { copyToClipboard } from '../../utility/clipboard';
import { filterUndefined, toHex } from '../../utility/functions';

import { DynamicOutput } from '../../react/code';
import { DynamicEntry } from '../../react/entry';
import { InputProps, RawInput } from '../../react/input';
import { shareState, shareStore } from '../../react/share';
import { AllEntries, DynamicEntries, getDefaultVersionedState, ProvidedDynamicEntries, setState, VersionedState, VersioningEvent } from '../../react/state';
import { PersistedStore } from '../../react/store';

/* ------------------------------ Dynamic entries ------------------------------ */

const input: DynamicEntry<string> = {
    name: 'Input',
    description: 'The input that you want to normalize.',
    defaultValue: 'Café',
    inputType: 'text',
    labelWidth: 43,
    inputWidth: 280,
};

const normalizations = {
    none: `None (depends on your system)`,
    NFC: 'Canonical composition (NFC)',
    NFD: 'Canonical decomposition (NFD)',
    NFKC: 'Compatibility composition (NFKC)',
    NFKD: 'Compatibility decomposition (NFKD)',
};

const normalization: DynamicEntry<string> = {
    name: 'Normalization',
    description: 'The form to which you want to normalize the input.',
    defaultValue: 'none',
    inputType: 'select',
    labelWidth: 105,
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

const store = new PersistedStore<VersionedState<State>, AllEntries<State>, VersioningEvent>(getDefaultVersionedState(entries), { entries }, 'encoding-normalization');
const Input = shareStore<VersionedState<State>, ProvidedDynamicEntries<State> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);

/* ------------------------------ User interface ------------------------------ */

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

function RawNormalizationOutput(versionedState: VersionedState<State>): JSX.Element {
    const { input, normalization } = versionedState.inputs;
    const parsed = input.replace(/\\u\{([0-9A-Fa-f]{1,6})\}|\\u([0-9A-Fa-f]{4})|\\x([0-9A-Fa-f]{2})/g, (_, g1, g2, g3) => {
        const hex = g1 ?? g2 ?? g3;
        if (hex === undefined) {
            throw new Error('At least one capturing group should be defined.');
        }
        return String.fromCodePoint(Number.parseInt(hex, 16));
    });
    const normalized = normalization !== 'none' ? parsed.normalize(normalization) : parsed;
    const points = filterUndefined(Array.from(normalized).map(char => char.codePointAt(0)));
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

const NormalizationOutput = shareState<VersionedState<State>, {}, AllEntries<State>, VersioningEvent>(store, 'input')(RawNormalizationOutput);

export const toolEncodingNormalization = <Fragment>
    <Input entries={entries}/>
    <NormalizationOutput/>
</Fragment>;

/* ------------------------------ Element bindings ------------------------------ */

function clickHandler(this: HTMLElement): void {
    const { input, normalization } = this.dataset;
    setState(store, { input, normalization });
}

export function bindUnicodeNormalizations() {
    Array.from(document.getElementsByClassName('bind-unicode-normalization') as HTMLCollectionOf<HTMLElement>).forEach(element => {
        const { input, normalization } = element.dataset;
        if (input === undefined || !Object.keys(normalizations).includes(normalization!)) {
            console.error('The data attributes of the following element are invalid:', element);
        } else {
            element.addEventListener('click', clickHandler);
        }
    });
}