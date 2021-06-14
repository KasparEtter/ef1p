/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { envelopeFromAdmin, envelopeToDave, incomingExampleNet, incomingIetfOrg, printEnvelope } from './message-envelope';

printEnvelope(
    incomingIetfOrg,
    incomingExampleNet,
    [envelopeFromAdmin, envelopeToDave],
);
