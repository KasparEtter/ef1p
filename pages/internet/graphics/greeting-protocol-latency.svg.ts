import { printProtocol } from '../../../code/svg/graphics/protocol';
import { entities, messages } from './greeting-protocol';

[messages[1], messages[3], messages[4]].forEach(message => {
    message.latency = 1;
    message.color = 'blue';
});

messages[4].delay = -1;

printProtocol(entities, messages);
