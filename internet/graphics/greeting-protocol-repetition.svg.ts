import { Message, printProtocol } from '../../typescript/svg/graphics/protocol';
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
