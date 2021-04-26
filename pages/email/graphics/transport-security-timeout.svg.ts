import { bold, T, uppercase } from '../../../code/svg/elements/text';

import { Entity, Message, printProtocol } from '../../../code/svg/graphics/protocol';

const entities: Entity[] = [
    { text: bold('Client') },
    { text: bold('Attacker'), color: 'red' },
    { text: bold('Server') },
];

const messages: Message[] = [
    {
        from: 0,
        to: 1,
        text: T('(Open ', uppercase('tls'), ' connection)'),
        color: 'gray',
    },
    {
        from: 0,
        to: 1,
        text: T('(Open ', uppercase('tcp'), ' connection)'),
        color: 'gray',
        delay: 3,
    },
    {
        from: 1,
        to: 2,
        text: T('(Open ', uppercase('tcp'), ' or ', uppercase('tls'), ' connection)'),
        color: 'gray',
    },
    {
        from: 2,
        to: 1,
        text: '220 server.example.com',
        color: 'green',
    },
    {
        from: 1,
        to: 0,
        text: '220 server.example.com',
        color: 'green',
    },
    {
        from: 0,
        to: 1,
        text: 'EHLO client.example.org',
        color: 'blue',
    },
    {
        from: 1,
        to: 2,
        text: 'EHLO client.example.org',
        color: 'blue',
    },
];

printProtocol(entities, messages, 275);
