import { clientAlice, envelopeFromAlice, envelopeToDavid, messageBccDavid, messageFromAlice, messageToBob, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    clientAlice,
    outgoingExampleOrg,
    [envelopeFromAlice, envelopeToDavid],
    [messageFromAlice, messageToBob, messageBccDavid],
);
