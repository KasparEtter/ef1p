import { clientAlice, envelopeFromAlice, envelopeToBob, envelopeToCarol, envelopeToIetf, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    clientAlice,
    outgoingExampleOrg,
    [envelopeFromAlice, envelopeToBob, envelopeToCarol, envelopeToIetf],
);
