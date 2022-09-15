/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, outOfFlow, subscript, superscript, T, Text } from '../../../code/svg/elements/text';

const side = 3 * textToLineDistance;
const size = P(side, side);
const largerSize = P(2 * side, side);

const elements = new Array<VisualElement>();

const A1 = new Rectangle({ position: P(0, 0), size });
elements.push(...A1.withText(bold('a')));

const B1 = new Rectangle({ position: P(2 * side, 0), size });
elements.push(...B1.withText(bold('b')));

const C1 = new Rectangle({ position: P(4 * side, 0), size: largerSize });
elements.push(...C1.withText(bold('a + b')));

const A2 = new Rectangle({ position: P(0, 2 * side), size });
elements.push(...A2.withText(bold(T('G', superscript('a')))));

const B2 = new Rectangle({ position: P(2 * side, 2 * side), size });
elements.push(...B2.withText(bold(T('G', superscript('b')))));

const C2 = new Rectangle({ position: P(4 * side, 2 * side), size: largerSize });
elements.push(...C2.withText(bold(T('G', superscript('a + b')))));

elements.unshift(Line.connectBoxes(A1, 'bottom', A2, 'top', { marker: ['start', 'end'], color: 'blue' }));
elements.unshift(Line.connectBoxes(B1, 'bottom', B2, 'top', { marker: ['start', 'end'], color: 'blue' }));
elements.unshift(Line.connectBoxes(C1, 'bottom', C2, 'top', { marker: ['start', 'end'], color: 'blue' }));

elements.push(new Text({ text: bold('+'), position: P(1.5 * side, 0.5 * side + 1) }));
elements.push(new Text({ text: bold('='), position: P(3.5 * side, 0.5 * side) }));

elements.push(new Text({ text: bold('·'), position: P(1.5 * side, 2.5 * side + 1) }));
elements.push(new Text({ text: bold('='), position: P(3.5 * side, 2.5 * side) }));

const vector = P(-1.2 * side, 0);
elements.push(A1.text(T('ℤ', outOfFlow(superscript('+')), subscript('m'), ':'), { ignoreForClipping: false }).move(vector));
elements.push(A2.text('⟨G⟩:', { ignoreForClipping: false }).move(vector));

printSVG(...elements);
