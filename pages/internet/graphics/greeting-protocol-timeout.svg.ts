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
