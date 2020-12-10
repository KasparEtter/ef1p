import { printProtocol } from '../../../code/svg/graphics/protocol';
import { P } from '../../../code/svg/utility/point';
import { entities, messages } from './greeting-protocol';

messages[3].color = 'blue';
messages[3].latency = 2;
messages[3].delay = -2;
messages[3].textOffset = P(60, -20);
messages[4].color = 'green';
messages[4].delay = 1;
messages[4].textOffset = P(-50, 0);

printProtocol(entities, messages);
