import { bold, T, uppercase } from '../../../code/svg/elements/text';

import { Entity, Message, printProtocol } from '../../../code/svg/graphics/protocol';

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
        text: T('(Open ', uppercase('tcp'), ' connection)'),
        color: 'gray',
    },
    {
        ...left,
        text: '220 server.example.com',
    },
    {
        ...right,
        text: 'EHLO client.example.org',
    },
    {
        ...left,
        text: [
            '250-server.example.com',
            '250-PIPELINING',
            T('250 ', uppercase('starttls')),
        ],
    },
    {
        ...right,
        text: uppercase('starttls'),
    },
    {
        ...left,
        text: '220 Go ahead',
    },
    {
        ...right,
        text: T('(Start ', uppercase('tls'), ' negotiation)'),
        color: 'gray',
    },
    {
        ...left,
        text: T('(Negotiate a ', uppercase('tls'), ' session)'),
        color: 'gray',
    },
    {
        ...right,
        text: T('(Continue with ', uppercase('tls'), ')'),
        color: 'gray',
    },
];

printProtocol(entities, messages, 275);
