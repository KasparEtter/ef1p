import { printProtocol } from '../../typescript/svg/graphics/protocol';
import { P } from '../../typescript/svg/utility/point';
import { entities, messages } from './greeting-protocol';

messages[3].color = 'blue';
messages[3].latency = 2;
messages[3].delay = -2;
messages[3].textOffset = P(60, -15);
messages[4].color = 'green';
messages[4].delay = 1;
messages[4].textOffset = P(-48, 0);

printProtocol(entities, messages);
