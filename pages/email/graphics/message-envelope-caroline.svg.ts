/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { envelopeFromAlice, envelopeToCaroline, incomingExampleCom, incomingExampleNet, printEnvelope } from './message-envelope';

printEnvelope(
    incomingExampleCom,
    incomingExampleNet,
    [envelopeFromAlice, envelopeToCaroline],
);
