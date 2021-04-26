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
