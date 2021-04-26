import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { bold, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(['Outgoing', 'mail server'].map(bold));
const mailClientSize = estimateTextSizeWithMargin(bold('mail server'));

const gapX = mailClientSize.x;
const gapY = size.y;

export const elements = new Array<VisualElement>();

export const mailClientBox = new Rectangle({
    position: P((size.x + gapX) / 2, size.y + gapY),
    size: mailClientSize,
});
export const mailClientText = mailClientBox.text(bold('Mail client'));
elements.push(mailClientBox, mailClientText);

export const incomingMailServerBox = new Rectangle({ position: P(0, 0), size });
export const incomingMailServerText = incomingMailServerBox.text([bold('Incoming'), bold('mail server')]);
elements.push(incomingMailServerBox, incomingMailServerText);

export const outgoingMailServerBox = new Rectangle({ position: P(size.x + gapX, 0), size });
export const outgoingMailServerText = outgoingMailServerBox.text([bold('Outgoing'), bold('mail server')]);
elements.push(outgoingMailServerBox, outgoingMailServerText);
