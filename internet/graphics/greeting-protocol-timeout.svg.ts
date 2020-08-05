import { Message, printProtocol } from '../../typescript/svg/graphics/protocol';
import { entities, left, messages } from './greeting-protocol';

const newMessage: Message = {
    ...left,
    text: 'Bye.',
    color: 'red',
}

messages[1].delay = 3;

messages.splice(2, 4, newMessage);
printProtocol(entities, messages);
