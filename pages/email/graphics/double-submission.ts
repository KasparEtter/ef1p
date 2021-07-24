/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { bold, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateTextSizeWithMargin(['Outgoing', 'mail server'].map(bold));
const mailClientSize = estimateTextSizeWithMargin(bold('mail server'));

const gapX = mailClientSize.x;
const gapY = size.y;

export const elements = new Array<VisualElement>();

export const mailClientBox = new Rectangle({ position: P((size.x + gapX) / 2, size.y + gapY), size: mailClientSize });
elements.push(...mailClientBox.withText(bold('Mail client')));

export const incomingMailServerBox = new Rectangle({ position: P(0, 0), size });
elements.push(...incomingMailServerBox.withText([bold('Incoming'), bold('mail server')]));

export const outgoingMailServerBox = new Rectangle({ position: P(size.x + gapX, 0), size });
elements.push(...outgoingMailServerBox.withText([bold('Outgoing'), bold('mail server')]));
