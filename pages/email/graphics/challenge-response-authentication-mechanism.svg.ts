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
