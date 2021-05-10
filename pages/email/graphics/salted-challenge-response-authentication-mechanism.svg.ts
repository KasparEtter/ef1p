/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Message, printProtocol } from '../../../code/svg/graphics/protocol';

const right = {
    from: 0,
    to: 1,
    color: 'blue',
} as const;

const left = {
    from: 1,
    to: 0,
    color: 'green',
} as const;

const entities = ['Client', 'Server'];

const messages: Message[] = [
    {
        ...right,
        text: 'Username, ClientNonce',
    },
    {
        ...left,
        text: 'ServerNonce, Salt, IterationCount',
    },
    {
        ...right,
        text: 'KeyXorHashedKeyMac',
    },
    {
        ...left,
        text: 'KeyMac',
    },
];

printProtocol(entities, messages, 300);
