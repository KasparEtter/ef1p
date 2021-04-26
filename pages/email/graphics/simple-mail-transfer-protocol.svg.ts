import { Message, printProtocol } from '../../../code/svg/graphics/protocol';

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
        text: '(Open connection)',
        color: 'gray',
    },
    {
        ...left,
        text: '220 server.example.com',
    },
    {
        ...right,
        text: 'HELO client.example.org',
    },
    {
        ...left,
        text: '250 server.example.com',
    },
    {
        ...right,
        text: 'MAIL FROM:<alice@example.org>',
    },
    {
        ...left,
        text: '250 Ok',
    },
    {
        ...right,
        text: 'RCPT TO:<bob@example.com>',
    },
    {
        ...left,
        text: '250 Ok',
    },
    {
        ...right,
        text: 'DATA',
    },
    {
        ...left,
        text: '354 Go ahead',
    },
    {
        ...right,
        text: '(Actual message)',
    },
    {
        ...left,
        text: '250 Ok',
    },
    {
        ...right,
        text: 'QUIT',
    },
    {
        ...left,
        text: '221 Bye',
    },
    {
        ...left,
        text: '(Close connection)',
        color: 'gray',
    },
];

printProtocol(entities, messages, 320);
