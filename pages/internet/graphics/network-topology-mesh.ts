/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { zeroPoint } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { Line } from '../../../code/svg/elements/line';
import { small } from '../../../code/svg/elements/text';

import { defaultDistance, lineProperties, nodeProperties, relayProperties } from './network-topology';

const fifteenDegrees = Math.PI / 12;


const relayPoints = [
    zeroPoint,
    zeroPoint.point(defaultDistance, fifteenDegrees * 23),
    zeroPoint.point(defaultDistance, fifteenDegrees * 3),
];

const nodePoints = [
    relayPoints[0].point(defaultDistance, fifteenDegrees * 10),
    relayPoints[0].point(defaultDistance, fifteenDegrees * 16),
    relayPoints[1].point(defaultDistance, fifteenDegrees * 21),
    relayPoints[1].point(defaultDistance, fifteenDegrees * 3),
    relayPoints[2].point(defaultDistance, fifteenDegrees * 4),
    relayPoints[2].point(defaultDistance, fifteenDegrees * 9),
];

export const relays = relayPoints.map(point => new Circle({ center: point, ...relayProperties }));
export const nodes = nodePoints.map(point => new Circle({ center: point, ...nodeProperties }));

export const [A, B, C] = relays;
export const [A1, A2, B1, B2, C2, C3] = nodes;

export const linkPairs = [
    [A, A1],
    [A, A2],
    [A, B],
    [A, C],
    [B, C],
    [B, B1],
    [B, B2],
    [C, B2],
    [C, C2],
    [C, C3],
];
export const links = linkPairs.map(pair => Line.connectEllipses(pair[0], pair[1], lineProperties));

export const relayLabels = ['A', 'B', 'C'].map((text, index) => relays[index].text(text));
export const nodeLabels = ['A1', 'A2', 'B1', ['B2', '', '', 'C1'], 'C2', 'C3'].map((text, index) => nodes[index].text(text));
export const linkLabels = ['1', '2', '3', '4'].map((text, index) => links[index].text(small(text), index < 2 ? 'right' : 'left', 14, { horizontalAlignment: 'middle', verticalAlignment: 'middle' }));
