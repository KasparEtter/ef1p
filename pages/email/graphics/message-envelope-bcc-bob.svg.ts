import { clientAlice, envelopeFromAlice, envelopeToBob, messageFromAlice, messageToBob, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    clientAlice,
    outgoingExampleOrg,
    [envelopeFromAlice, envelopeToBob],
    [messageFromAlice, messageToBob],
);
