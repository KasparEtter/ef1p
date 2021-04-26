import { bold } from '../../../code/svg/elements/text';
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
        text: '(Connect)',
        color: 'gray',
    },
    {
        from: 1,
        to: 2,
        text: '(Connect)',
        color: 'gray',
    },
    {
        from: 2,
        to: 1,
        text: 'Challenge',
        color: 'green',
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
    {
        from: 1,
        to: 2,
        text: 'Response',
        color: 'blue',
    },
];

printProtocol(entities, messages, 150);
