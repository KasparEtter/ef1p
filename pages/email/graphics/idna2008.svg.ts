/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { T, uppercase } from '../../../code/svg/elements/text';

import { printFlowchart } from '../../../code/svg/graphics/flowchart';

printFlowchart([
    { text: 'Arbitrary user input', color: 'blue' },
    { text: 'Reject symbols and punctuation marks', color: 'gray' },
    { text: 'Lowercase or reject uppercase characters', color: 'gray' },
    { text: T(uppercase('nfkc'), '-normalize or reject non-normalized labels'), color: 'gray' },
    { text: 'Accept only valid characters' },
    { text: 'Encode with Punycode' },
    { text: T('Domain name in ', uppercase('ascii')), color: 'green' },
]);
