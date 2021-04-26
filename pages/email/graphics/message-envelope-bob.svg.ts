import { envelopeFromAlice, envelopeToBob, envelopeToCarol, incomingExampleCom, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    outgoingExampleOrg,
    incomingExampleCom,
    [envelopeFromAlice, envelopeToBob, envelopeToCarol],
);
