/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { printProtocol } from '../../../code/svg/graphics/protocol';
import { entities, messages } from './greeting-protocol';

[messages[1], messages[3], messages[4]].forEach(message => {
    message.latency = 1;
    message.color = 'blue';
});

messages[4].delay = -1;

printProtocol(entities, messages);
