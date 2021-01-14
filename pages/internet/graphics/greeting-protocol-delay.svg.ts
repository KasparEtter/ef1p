import { printProtocol } from '../../../code/svg/graphics/protocol';
import { P } from '../../../code/svg/utility/point';
import { entities, messages } from './greeting-protocol';

messages[3].color = 'blue';
messages[3].latency = 2;
messages[3].textOffset = P(60, -22);
messages[4].color = 'green';
messages[4].delay = -2;
messages[4].textOffset = P(-50, 0);
messages[5].delay = 1;

printProtocol(entities, messages);
