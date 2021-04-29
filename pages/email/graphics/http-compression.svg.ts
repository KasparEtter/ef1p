import { T, uppercase } from '../../../code/svg/elements/text';
import { Message, printProtocol } from '../../../code/svg/graphics/protocol';

const entities = ['Web client', 'Web server'];

const HTTP = uppercase('http');

const messages: Message[] = [
    {
        from: 0,
        to: 1,
        text: [
            T('GET /file ', HTTP, '/1.1'),
            'Accept-Encoding: br, gzip',
        ],
        color: 'blue',
    },
    {
        from: 1,
        to: 0,
        text: [
            T(HTTP, '/1.1 200 OK'),
            'Content-Encoding: gzip',
        ],
        color: 'green',
    },
];

printProtocol(entities, messages);