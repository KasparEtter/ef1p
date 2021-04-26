import { Message, printProtocol } from '../../../code/svg/graphics/protocol';

const entities = ['Client', 'Server'];

const messages: Message[] = [
    {
        from: 0,
        to: 1,
        text: 'ClientMessage, hmac(Key, ClientMessage)',
        color: 'blue',
    },
    {
        from: 1,
        to: 0,
        text: 'ServerMessage, hmac(Key, ServerMessage)',
        color: 'green',
    },
];

printProtocol(entities, messages, 350);
