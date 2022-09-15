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
import { bold, large, Text } from '../../../code/svg/elements/text';

const side = 3 * textToLineDistance;
const size = P(side, side);

const elements = new Array<VisualElement>();

const a = new Rectangle({ position: P(0, 0), size });
const b = new Rectangle({ position: P(2 * side, 0), size });
const c = new Rectangle({ position: P(4 * side, 0), size });
const A = new Rectangle({ position: P(0, 2 * side), size });
const B = new Rectangle({ position: P(2 * side, 2 * side), size });
const C = new Rectangle({ position: P(4 * side, 2 * side), size });
elements.push(a, b, c, A, B, C);

elements.unshift(Line.connectBoxes(a, 'bottom', A, 'top', { color: 'green' }).moveRight());
elements.unshift(Line.connectBoxes(A, 'top', a, 'bottom', { color: 'red' }).moveRight());

elements.unshift(Line.connectBoxes(b, 'bottom', B, 'top', { color: 'green' }).moveRight());
elements.unshift(Line.connectBoxes(B, 'top', b, 'bottom', { color: 'red' }).moveRight());

elements.unshift(Line.connectBoxes(c, 'bottom', C, 'top', { color: 'green' }).moveRight());
elements.unshift(Line.connectBoxes(C, 'top', c, 'bottom', { color: 'red' }).moveRight());

elements.push(new Text({ text: bold('+'), position: P(1.5 * side, 0.5 * side) }));
elements.push(new Text({ text: bold('='), position: P(3.5 * side, 0.5 * side) }));

elements.push(new Text({ text: large('∘'), position: P(1.5 * side, 2.5 * side + 1) }));
elements.push(new Text({ text: bold('='), position: P(3.5 * side, 2.5 * side) }));

printSVG(...elements);
