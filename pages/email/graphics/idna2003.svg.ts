/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { T, uppercase } from '../../../code/svg/elements/text';

import { printFlowchart } from '../../../code/svg/graphics/flowchart';

printFlowchart([
    { text: 'Arbitrary user input', color: 'blue' },
    { text: 'Remove certain characters' },
    { text: 'Case fold all characters' },
    { text: T(uppercase('nfkc'), '-normalize the labels') },
    { text: 'Reject certain characters' },
    { text: 'Encode with Punycode' },
    { text: T('Domain name in ', uppercase('ascii')), color: 'green' },
]);
