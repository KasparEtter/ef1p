/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { textHeight, textToLineDistance } from '../../../code/svg/utility/constants';
import { P, zeroPoint } from '../../../code/svg/utility/point';

import { Arc } from '../../../code/svg/elements/arc';
import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { InvisiblePoint } from '../../../code/svg/elements/invisible';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, large, superscript, T, Text } from '../../../code/svg/elements/text';

const amount = 10;
const middle = amount / 2;
const clockRadius = 80;
const dashRadius = 5;
const arcRadius = clockRadius * 2 / 3;

const elements = new Array<VisualElement>();

const innerPoints = zeroPoint.radial(clockRadius - dashRadius, amount);
const outerPoints = zeroPoint.radial(clockRadius + dashRadius, amount);
const textPoints = zeroPoint.radial(clockRadius + dashRadius + textToLineDistance + textHeight / 2, amount);
const invisiblePoints = zeroPoint.radial(clockRadius + dashRadius + textToLineDistance + textHeight * 1.25, 4);

elements.push(new Circle({ center: zeroPoint, radius: clockRadius }));
elements.push(...innerPoints.map((point, index) => new Line({ start: point, end: outerPoints[index], color: index === 0 ? 'blue' : undefined })));
elements.push(...textPoints.map((point, index) => new Text({ position: point, text: bold(index === middle ? '…' : T('G', superscript((index > middle ? '−' + (amount - index) : index).toString()))) })));
elements.push(new Arc({ start: P(0, -arcRadius), startSide: 'right', end: P(0, arcRadius), endSide: 'right', radius: arcRadius, marker: 'end', color: 'blue' }));
elements.push(new Text({ position: P(0, 3), text: large('𝔾'), color: 'green' }));
elements.push(...invisiblePoints.map(point => new InvisiblePoint({ point })));

printSVG(...elements);
