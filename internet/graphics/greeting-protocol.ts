import { Message } from '../../typescript/svg/graphics/protocol';

export const right = {
    from: 0,
    to: 1,
};

export const left = {
    from: 1,
    to: 0,
};

export const entities = ['Alice', 'Bob'];

export let messages: Message[] = [
    {
        ...right,
        text: 'Hi Bob!',
    },
    {
        ...left,
        text: 'Hi Alice!',
    },
    {
        ...right,
        text: 'How are you?',
    },
    {
        ...left,
        text: 'Good.',
    },
    {
        ...left,
        text: 'What about you?',
    },
    {
        ...right,
        text: 'I\'m fine, thanks.',
    },
];
