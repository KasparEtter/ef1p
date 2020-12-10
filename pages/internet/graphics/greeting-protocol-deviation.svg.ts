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
