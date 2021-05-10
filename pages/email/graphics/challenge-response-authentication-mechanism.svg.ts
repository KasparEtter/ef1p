/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Message, printProtocol } from '../../../code/svg/graphics/protocol';

const entities = ['Client', 'Server'];

const messages: Message[] = [
    {
        from: 0,
        to: 1,
        text: '(Connect)',
        color: 'gray',
    },
    {
        from: 1,
        to: 0,
        text: 'Challenge',
        color: 'green',
    },
    {
        from: 0,
        to: 1,
        text: 'Response',
        color: 'blue',
    },
];

printProtocol(entities, messages, 150);
