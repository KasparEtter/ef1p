/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { clientAlice, envelopeFromAlice, envelopeToBob, envelopeToCarol, envelopeToDave, messageBccEmpty, messageFromAlice, messageToBob, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    clientAlice,
    outgoingExampleOrg,
    [envelopeFromAlice, envelopeToBob, envelopeToCarol, envelopeToDave],
    [messageFromAlice, messageToBob, messageBccEmpty],
);
