/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Message, printProtocol } from '../../../code/svg/graphics/protocol';
import { entities, left, messages, right } from './greeting-protocol';

const newMessages: Message[] = [
    {
        ...left,
        text: 'Not good.',
        color: 'red',
    },
    {
        ...right,
        text: 'What happened?',
        color: 'green',
    },
];

messages.splice(3, 3, ...newMessages);
printProtocol(entities, messages);
