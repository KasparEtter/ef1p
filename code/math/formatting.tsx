/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment, ReactNode } from 'react';

import { Color, getColorClass } from '../utility/color';

import { DynamicEntries, DynamicSingleSelectEntry } from '../react/entry';
import { Tool } from '../react/injection';
import { getInput } from '../react/input';
import { VersionedStore } from '../react/versioned-store';

import { encodeIntegerWithoutStore, IntegerFormat, normalizeToInteger, ToInteger } from './integer';

/* ------------------------------ Input ------------------------------ */

const selectOptions = {
    "'": "' (apostrophe, U+0027)",
    '.': '. (period, U+002E)',
    ',': ', (comma, U+002C)',
    '_': '_ (underscore, U+005F)',
    ' ': '␣ (space, U+0020)',
    '': '(none)',
};

const decimalSeparator: DynamicSingleSelectEntry<State> = {
    label: 'Decimal separator',
    tooltip: 'How to separate groups of three decimal digits from one another.',
    defaultValue: "'",
    inputType: 'select',
    selectOptions,
};

const hexadecimalSeparator: DynamicSingleSelectEntry<State> = {
    label: 'Hexadecimal separator',
    tooltip: 'How to separate groups of eight hexadecimal digits from one another.',
    defaultValue: ' ',
    inputType: 'select',
    selectOptions,
};

const minusSign: DynamicSingleSelectEntry<State> = {
    label: 'Minus sign',
    tooltip: 'Which character to use as the minus sign.',
    defaultValue: '−',
    inputType: 'select',
    selectOptions: {
        '−': '− (minus sign, U+2212)',
        '-': '- (hyphen-minus, U+002D)',
    },
};

const multiplicationSign: DynamicSingleSelectEntry<State> = {
    label: 'Multiplication sign',
    tooltip: 'Which character to use as the multiplication sign.',
    defaultValue: '·',
    inputType: 'select',
    selectOptions: {
        '·': '· (middle dot, U+00B7)',
        '⋅': '⋅ (dot operator, U+22C5)',
        '*': '* (asterisk, U+002A)',
        '×': '× (multiplication sign, U+00D7)',
    },
};

const divisionSign: DynamicSingleSelectEntry<State> = {
    label: 'Division sign',
    tooltip: 'Which character to use as the division sign.',
    defaultValue: '/',
    inputType: 'select',
    selectOptions: {
        '/': '/ (slash, U+002F)',
        ':': ': (colon, U+003A)',
        '÷': '÷ (division sign, U+00F7)',
    },
};

const moduloSign: DynamicSingleSelectEntry<State> = {
    label: 'Modulo sign',
    tooltip: 'Which character(s) to use as the modulo sign.',
    defaultValue: '%',
    inputType: 'select',
    selectOptions: {
        '%': '% (percent sign, U+0025)',
        'mod': 'mod (character sequence)',
    },
};

const exponentiationSign: DynamicSingleSelectEntry<State> = {
    label: 'Exponentiation sign',
    tooltip: 'Which character(s) to use for exponentiation.',
    defaultValue: '',
    inputType: 'select',
    selectOptions: {
        '': '(none, raise exponent)',
        '^': '^ (caret, U+005E)',
        '**': '** (double asterisk)',
    },
};

interface State {
    decimalSeparator: string;
    hexadecimalSeparator: string;
    minusSign: string;
    multiplicationSign: string;
    divisionSign: string;
    moduloSign: string;
    exponentiationSign: string;
}

const entries: DynamicEntries<State> = {
    decimalSeparator,
    hexadecimalSeparator,
    minusSign,
    multiplicationSign,
    divisionSign,
    moduloSign,
    exponentiationSign,
};

const store = new VersionedStore(entries, 'math-formatting');
const Input = getInput(store);

/* ------------------------------ Integer ------------------------------ */

export function encodeInteger(
    integer: number | bigint | ToInteger,
    format: IntegerFormat = 'decimal',
    parenthesesIfNegative = false,
): string {
    const state = store.getCurrentState();
    return encodeIntegerWithoutStore(integer, format, parenthesesIfNegative, state.decimalSeparator, state.hexadecimalSeparator, state.minusSign);
}

/* ------------------------------ Outputs ------------------------------ */

export interface IntegerProps {
    /**
     * The integer to output.
     */
    readonly integer: number | bigint | ToInteger;

    /**
     * The format used to output the integer.
     * The default format is decimal.
     */
    readonly format?: IntegerFormat;

    /**
     * Whether to surround the integer with parentheses if it is negative.
     * This option defaults to false.
     */
    readonly parenthesesIfNegative?: boolean;

    /**
     * The color of the integer.
     */
    readonly color?: Color | undefined;
}

function RawInteger({ integer, format, parenthesesIfNegative, color, decimalSeparator, hexadecimalSeparator, minusSign }: IntegerProps & State): JSX.Element {
    const output = encodeIntegerWithoutStore(normalizeToInteger(integer), format, parenthesesIfNegative, decimalSeparator, hexadecimalSeparator, minusSign);
    return color ? <span className={getColorClass(color)}>{output}</span> : <Fragment>{output}</Fragment>;
}

export const Integer = store.injectCurrentState<IntegerProps>(RawInteger);

export function renderInteger(integer: number | bigint | ReactNode, format: IntegerFormat = 'decimal', parentheses = false, color?: Color | undefined): ReactNode {
    return <Fragment>{parentheses && '('}{typeof integer === 'number' || typeof integer === 'bigint' ? <Integer integer={integer} format={format} color={color}/> : integer}{parentheses && ')'}</Fragment>;
}

export interface SignProps {
    /**
     * Whether to not add spaces around the sign.
     * This option defaults to false.
     */
    readonly noSpaces?: boolean | undefined;
}

export const Sign = ({ noSpaces = false, sign }: SignProps & { sign: string }) => <Fragment>{noSpaces ? sign : ' ' + sign + ' '}</Fragment>;

export const AdditionSign = ({ noSpaces }: SignProps) => <Sign sign="+" noSpaces={noSpaces}/>;
export const MinusSign = store.injectCurrentState<SignProps>(({ minusSign, noSpaces }) => <Sign sign={minusSign} noSpaces={noSpaces}/>);
export const MultiplicationSign = store.injectCurrentState<SignProps>(({ multiplicationSign, noSpaces }) => <Sign sign={multiplicationSign} noSpaces={noSpaces}/>);
export const DivisionSign = store.injectCurrentState<SignProps>(({ divisionSign, noSpaces }) => <Sign sign={divisionSign} noSpaces={noSpaces}/>);
export const ModuloSign = store.injectCurrentState<SignProps>(({ moduloSign, noSpaces }) => <Sign sign={moduloSign} noSpaces={noSpaces}/>);

export interface ExponentProps {
    /**
     * The exponent of the exponentiation.
     */
    readonly exponent: ReactNode;

    /**
     * Whether to surround the exponent with parentheses if it is not raised.
     * This option defaults to false.
     */
    readonly parenthesesIfNotRaised?: boolean;
}

function RawExponent({ exponent, parenthesesIfNotRaised = false, exponentiationSign }: ExponentProps & State): JSX.Element {
    if (exponentiationSign === '') {
        return <sup>{exponent}</sup>;
    } else {
        return <Fragment>{exponentiationSign}{parenthesesIfNotRaised && '('}{exponent}{parenthesesIfNotRaised && ')'}</Fragment>;
    }
}

export const Exponent = store.injectCurrentState<ExponentProps>(RawExponent);

export const Inverse = <Exponent exponent={<Fragment><MinusSign noSpaces/>1</Fragment>} parenthesesIfNotRaised/>;

/* ------------------------------ List separator ------------------------------ */

function getListSeparatorWithoutStore(format: IntegerFormat, decimalSeparator: string, hexadecimalSeparator: string): string {
    switch (format) {
        case 'raw':
            return ',';
        case 'decimal':
            return decimalSeparator === ',' ? ';' : ',';
        case 'hexadecimal':
            return hexadecimalSeparator === ',' ? ';' : ',';
    }
}

export function getListSeparator(format: IntegerFormat): string {
    const state = store.getCurrentState();
    return getListSeparatorWithoutStore(format, state.decimalSeparator, state.hexadecimalSeparator);
}

export interface ListSeparatorProps {
    /**
     * The format used to output the surrounding integers.
     */
    readonly format: IntegerFormat;
}

function RawListSeparator({ format, decimalSeparator, hexadecimalSeparator }: ListSeparatorProps & State): JSX.Element {
    return <Fragment>{getListSeparatorWithoutStore(format, decimalSeparator, hexadecimalSeparator)}</Fragment>;
}

export const ListSeparator = store.injectCurrentState<ListSeparatorProps>(RawListSeparator);

/* ------------------------------ Tool ------------------------------ */

const integer = BigInt('1234567890987654321');

export const toolMathFormatting: Tool = [
    <Fragment>
        <Input newColumnAt={4}/>
        <table className="list text-right">
            <tr><th>Decimal integer:</th><td><Integer integer={integer} format="decimal"/></td></tr>
            <tr><th>Hexadecimal integer:</th><td><Integer integer={integer} format="hexadecimal"/></td></tr>
            <tr><th>Equation:</th><td>1<AdditionSign/>2<MinusSign/>3<MultiplicationSign/>4<DivisionSign/>5<ModuloSign/>6<Exponent exponent="7"/></td></tr>
        </table>
    </Fragment>,
    store,
];
