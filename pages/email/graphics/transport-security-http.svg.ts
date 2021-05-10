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
        from: 0,
        to: 1,
        text: [T('GET / ', uppercase('http'), '/1.0'), 'Host: www.example.com'],
        color: 'blue',
    },
    {
        from: 1,
        to: 2,
        text: T('(Open ', uppercase('tcp'), ' connection)'),
        color: 'gray',
    },
    {
        from: 1,
        to: 2,
        text: [T('GET / ', uppercase('http'), '/1.0'), 'Host: www.example.com'],
        color: 'blue',
    },
    {
        from: 2,
        to: 1,
        text: [T(uppercase('http'), '/1.0 301 Moved Permanently'), 'Location: https://www.example.com/'],
        color: 'green',
    },
    {
        from: 2,
        to: 1,
        text: T('(Close ', uppercase('tcp'), ' connection)'),
        color: 'gray',
    },
    {
        from: 1,
        to: 2,
        text: T('(Open ', uppercase('tls'), ' connection)'),
        color: 'gray',
        delay: 1,
    },
    {
        from: 1,
        to: 2,
        text: [T('GET / ', uppercase('http'), '/1.0'), 'Host: www.example.com'],
        color: 'blue',
    },
    {
        from: 2,
        to: 1,
        text: [T(uppercase('http'), '/1.0 200 ', uppercase('ok')), '[Headers and body]'],
        color: 'green',
    },
    {
        from: 2,
        to: 1,
        text: T('(Close ', uppercase('tls'), ' connection)'),
        color: 'gray',
    },
    {
        from: 1,
        to: 0,
        text: [T(uppercase('http'), '/1.0 200 ', uppercase('ok')), '[Rewritten headers and body]'],
        color: 'red',
    },
    {
        from: 1,
        to: 0,
        text: T('(Close ', uppercase('tcp'), ' connection)'),
        color: 'gray',
    },
];

printProtocol(entities, messages, 300);
