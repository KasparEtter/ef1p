import { clientAlice, envelopeFromAlice, envelopeToBob, envelopeToCarol, messageBccCarol, messageFromAlice, messageToBob, outgoingExampleOrg, printEnvelope } from './message-envelope';

printEnvelope(
    clientAlice,
    outgoingExampleOrg,
    [envelopeFromAlice, envelopeToCarol],
    [messageFromAlice, messageToBob, messageBccCarol],
);
