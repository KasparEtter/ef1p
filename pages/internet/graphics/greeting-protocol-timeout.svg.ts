/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Message, printProtocol } from '../../../code/svg/graphics/protocol';
import { entities, left, messages } from './greeting-protocol';

const newMessage: Message = {
    ...left,
    text: 'Bye.',
    color: 'red',
    delay: 3,
}

messages.splice(2, 4, newMessage);
printProtocol(entities, messages);
