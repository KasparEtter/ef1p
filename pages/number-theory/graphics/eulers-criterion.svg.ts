/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { textHeight } from '../../../code/svg/utility/constants';
import { P, zeroPoint } from '../../../code/svg/utility/point';

import { Arc } from '../../../code/svg/elements/arc';
import { Circle } from '../../../code/svg/elements/circle';
import { VisualElement } from '../../../code/svg/elements/element';
import { InvisiblePoint } from '../../../code/svg/elements/invisible';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, large, outOfFlow, subscript, superscript, T, Text, TextLine } from '../../../code/svg/elements/text';

const amount = 10;
const clockRadius = 90;
const dashRadius = 5;
const arcRadius = clockRadius * 2 / 3;

const elements = new Array<VisualElement>();

const innerPoints = zeroPoint.radial(clockRadius - dashRadius, amount);
const outerPoints = zeroPoint.radial(clockRadius + dashRadius, amount);
const textPoints = zeroPoint.radial(clockRadius * 4 / 3, amount);
const invisiblePoints = zeroPoint.radial(clockRadius * 4 / 3 + textHeight, 4);

const residueColor = 'green';
const nonResidueColor = 'red';

const colors: (Color | undefined)[] = [
    residueColor,
    nonResidueColor,
    residueColor,
    nonResidueColor,
    undefined,
    undefined,
    undefined,
    nonResidueColor,
    residueColor,
    nonResidueColor,
];

const texts: TextLine[] = [
    T('G', superscript('p − 1'), ' =', subscript('p'), ' G', superscript('0'), ' =', subscript('p'), ' 1'),
    T('G', superscript('1')),
    T('G', superscript('2')),
    T('G', superscript('3')),
    '…',
    T('G', superscript('(p − 1) / 2'), ' =', subscript('p'), ' −1'),
    '…',
    T('G', superscript('p − 4')),
    T('G', superscript('p − 3')),
    T('G', superscript('p − 2')),
];

elements.push(new Circle({ center: zeroPoint, radius: clockRadius }));
elements.push(...innerPoints.map((point, index) => new Line({ start: point, end: outerPoints[index], color: colors[index] })));
elements.push(...textPoints.map((point, index) => new Text({ position: point, text: bold(texts[index]), color: colors[index] })));
elements.push(new Arc({ start: P(0, -arcRadius), startSide: 'right', end: P(0, arcRadius), endSide: 'right', radius: arcRadius, marker: 'end', color: 'blue' }));
elements.push(new Text({ position: P(0, 3), text: T(large('ℤ'), outOfFlow(large(superscript('×'))), large(subscript('p'))) }));
elements.push(...invisiblePoints.map(point => new InvisiblePoint({ point })));

printSVG(...elements);
