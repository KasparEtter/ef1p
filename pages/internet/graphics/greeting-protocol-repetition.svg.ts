/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Message, printProtocol } from '../../../code/svg/graphics/protocol';
import { entities, left, messages, right } from './greeting-protocol';

const newMessages: Message[] = [
    {
        ...right,
        text: '�',
        color: 'red',
    },
    {
        ...left,
        text: 'Can you repeat that?',
        color: 'green',
    },
];

messages.splice(2, 0, ...newMessages);
printProtocol(entities, messages);
