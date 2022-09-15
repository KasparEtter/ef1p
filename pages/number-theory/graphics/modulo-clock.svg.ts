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
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, Text } from '../../../code/svg/elements/text';

const amount = 12;
const color = 'green';
const clockRadius = 80;
const dashRadius = 5;
const arcRadius = clockRadius * 2 / 3;

const elements = new Array<VisualElement>();

const innerPoints = zeroPoint.radial(clockRadius - dashRadius, amount);
const outerPoints = zeroPoint.radial(clockRadius + dashRadius, amount);
const textPoints = zeroPoint.radial(clockRadius + dashRadius + textToLineDistance + textHeight / 2, amount);

elements.push(new Circle({ center: zeroPoint, radius: clockRadius }));
elements.push(...innerPoints.map((point, index) => new Line({ start: point, end: outerPoints[index], color: index === 3 || index === 9 ? color : undefined })));
elements.push(...textPoints.map((point, index) => new Text({ position: point, text: bold(index.toString()), color: index === 3 || index === 9 ? color : undefined })));
elements.push(new Arc({ start: P(-arcRadius, 0), startSide: 'top', end: P(arcRadius, 0), endSide: 'top', radius: arcRadius, marker: 'end', color }));
elements.push(new Text({ position: zeroPoint, text: [bold('+ 6'), bold('mod 12')], verticalAlignment: 'bottom', color }));

printSVG(...elements);
