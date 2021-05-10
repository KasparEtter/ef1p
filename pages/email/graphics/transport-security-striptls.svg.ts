/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

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
        text: T('(Open ', uppercase('tcp'), ' connection)'),
        color: 'gray',
    },
    {
        from: 1,
        to: 2,
        text: T('(Open ', uppercase('tcp'), ' connection)'),
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
    {
        from: 2,
        to: 1,
        text: [
            '250-server.example.com',
            '250-PIPELINING',
            T('250 ', uppercase('starttls')),
        ],
        color: 'green',
    },
    {
        from: 1,
        to: 0,
        text: [
            '250-server.example.com',
            '250 PIPELINING',
        ],
        color: 'red',
    },
    {
        from: 0,
        to: 1,
        text: T('(Continue without ', uppercase('tls'), ')'),
        color: 'gray',
    },
    {
        from: 1,
        to: 2,
        text: T('(Continue with or without ', uppercase('tls'), ')'),
        color: 'gray',
    },
];

printProtocol(entities, messages, 275);
