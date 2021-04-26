import { envelopeFromAlice, envelopeToCaroline, incomingExampleCom, incomingExampleNet, printEnvelope } from './message-envelope';

printEnvelope(
    incomingExampleCom,
    incomingExampleNet,
    [envelopeFromAlice, envelopeToCaroline],
);
