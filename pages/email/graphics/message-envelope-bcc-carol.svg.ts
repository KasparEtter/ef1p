/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { clientAlice, envelopeFromAlice, envelopeToBob, envelopeToCarol, messageBccCarol, messageFromAlice, messageToBob, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    clientAlice,
    outgoingExampleOrg,
    [envelopeFromAlice, envelopeToCarol],
    [messageFromAlice, messageToBob, messageBccCarol],
);
