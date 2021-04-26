import { clientAlice, envelopeFromAlice, envelopeToCarol, envelopeToDavid, messageBccBoth1, messageBccBoth2, messageFromAlice, messageToBob, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    clientAlice,
    outgoingExampleOrg,
    [envelopeFromAlice, envelopeToCarol, envelopeToDavid],
    [messageFromAlice, messageToBob, messageBccBoth1, messageBccBoth2],
);
