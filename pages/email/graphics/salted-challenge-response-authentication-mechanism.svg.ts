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
        text: 'Username, ClientNonce',
    },
    {
        ...left,
        text: 'ServerNonce, Salt, IterationCount',
    },
    {
        ...right,
        text: 'KeyXorHashedKeyMac',
    },
    {
        ...left,
        text: 'KeyMac',
    },
];

printProtocol(entities, messages, 300);
