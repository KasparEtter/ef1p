import { clientAlice, envelopeFromAlice, envelopeToBob, envelopeToCarol, envelopeToDavid, messageFromAlice, messageToBob, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    clientAlice,
    outgoingExampleOrg,
    [envelopeFromAlice, envelopeToBob, envelopeToCarol, envelopeToDavid],
    [messageFromAlice, messageToBob],
);
