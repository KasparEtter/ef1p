import { envelopeFromAlice, envelopeToIetf, incomingIetfOrg, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    outgoingExampleOrg,
    incomingIetfOrg,
    [envelopeFromAlice, envelopeToIetf],
);
