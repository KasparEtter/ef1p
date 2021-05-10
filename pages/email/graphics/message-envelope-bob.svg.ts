/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { envelopeFromAlice, envelopeToBob, envelopeToCarol, incomingExampleCom, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    outgoingExampleOrg,
    incomingExampleCom,
    [envelopeFromAlice, envelopeToBob, envelopeToCarol],
);
