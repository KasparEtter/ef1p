import { envelopeFromAdmin, envelopeToDavid, incomingExampleNet, incomingIetfOrg, printEnvelope } from './message-envelope';

printEnvelope(
    incomingIetfOrg,
    incomingExampleNet,
    [envelopeFromAdmin, envelopeToDavid],
);
