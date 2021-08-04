/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { textHeight } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line, LineProps } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, T, Text, uppercase } from '../../../code/svg/elements/text';

export const gap = 30;
export const distance = 90;
export const size = P(140, 70);

// https://github.com/gettalong/kramdown/issues/671
export const MUA = uppercase('(mua)');
export const MSA = uppercase('(msa)');
export const MTA = uppercase('(mta)');
export const MDA = uppercase('(mda)');
export const MS = uppercase('(ms)');

const elements = new Array<VisualElement>();

const color = 'gray' ;

const sMUA = new Rectangle({ position: P(size.x + (gap - size.x) / 2, 2 * size.y + gap + distance), size });
elements.push(...sMUA.withText(['Mail user', T('agent ', MUA)].map(bold)));

const sMSA = new Rectangle({ position: P(size.x + gap, size.y + gap), size });
elements.push(...sMSA.withText(['Mail submission', T('agent ', MSA)].map(bold)));

const sMTA = new Rectangle({ position: P(size.x + gap, 0), size });
elements.push(...sMTA.withText(['Mail transfer', T('agent ', MTA)].map(bold)));

const sMDA = new Rectangle({ position: P(0, 0), size, color });
elements.push(...sMDA.withText(['Mail delivery', T('agent ', MDA)].map(bold)));

const sMS = new Rectangle({ position: P(0, size.y + gap), size });
elements.push(...sMS.withText(['Message', T('store ', MS)].map(bold)));

const rMUA = new Rectangle({ position: P(3 * size.x + gap + distance + (gap - size.x) / 2, 2 * size.y + gap + distance), size });
elements.push(...rMUA.withText(['Mail user', T('agent ', MUA)].map(bold)));

const rMSA = new Rectangle({ position: P(2 * size.x + gap + distance, size.y + gap), size, color });
elements.push(...rMSA.withText(['Mail submission', T('agent ', MSA)].map(bold)));

const rMTA = new Rectangle({ position: P(2 * size.x + gap + distance, 0), size });
elements.push(...rMTA.withText(['Mail transfer', T('agent ', MTA)].map(bold)));

const rMDA = new Rectangle({ position: P(3 * size.x + 2 * gap + distance, 0), size });
elements.push(...rMDA.withText(['Mail delivery', T('agent ', MDA)].map(bold)));

const rMS = new Rectangle({ position: P(3 * size.x + 2 * gap + distance, size.y + gap), size });
elements.push(...rMS.withText(['Message', T('store ', MS)].map(bold)));

const smtpColor: Pick<LineProps, 'color'> = { color: 'green' };
const imapColor: Pick<LineProps, 'color'> = { color: 'blue' };

elements.unshift(Line.connectBoxes(sMUA, 'top', sMSA, 'bottom', smtpColor));
elements.unshift(Line.connectBoxes(sMSA, 'top', sMTA, 'bottom', smtpColor));
elements.unshift(Line.connectBoxes(sMTA, 'right', rMTA, 'left', smtpColor));
elements.unshift(Line.connectBoxes(rMTA, 'right', rMDA, 'left', smtpColor));
elements.unshift(Line.connectBoxes(rMDA, 'bottom', rMS, 'top', smtpColor));

elements.unshift(Line.connectBoxes(sMUA, 'top', sMS, 'bottom', imapColor));
elements.unshift(Line.connectBoxes(rMUA, 'top', rMS, 'bottom', imapColor));

elements.push(new Text({
    position: P(size.x + gap / 2, -gap - textHeight),
    text: bold('Sender'),
    horizontalAlignment: 'middle',
    verticalAlignment: 'top',
}));

elements.push(new Text({
    position: P(3 * size.x + gap + distance + gap / 2, -gap - textHeight),
    text: bold('Recipient'),
    horizontalAlignment: 'middle',
    verticalAlignment: 'top',
}));

printSVG(...elements);
