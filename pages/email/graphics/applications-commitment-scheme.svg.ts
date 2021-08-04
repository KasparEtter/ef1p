/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeRadius, textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { Line } from '../../../code/svg/elements/line';
import { Polyline } from '../../../code/svg/elements/polyline';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, Text } from '../../../code/svg/elements/text';

import { defaultTimeUnit, generateProtocol, Message } from '../../../code/svg/graphics/protocol';

const entities = ['Alice', 'Bob'];

const messages: Message[] = [
    {
        from: 0,
        to: 1,
        text: 'hash(CoinFlipAlice + Nonce)',
        color: 'blue',
    },
    {
        from: 1,
        to: 0,
        text: 'CoinFlipBob',
        color: 'green',
    },
    {
        from: 0,
        to: 1,
        text: 'CoinFlipAlice, Nonce',
        color: 'blue',
    },
];

const [entityGroups, messageGroups] = generateProtocol(entities, messages, 240);

const lineGap = 25;
const color = 'pink';

const line = entityGroups[1].props.children[2] as Line;
const startX = line.props.end.x + strokeRadius;
const startY = line.props.end.y - textToLineDistance - strokeRadius;
const endY = startY - 2 * defaultTimeUnit;
const midX = startX + lineGap;

const polyline = new Polyline({
    points: [
        P(startX, startY),
        P(midX, startY),
        P(midX, endY),
        P(startX, endY),
    ],
    marker: ['end'],
    color,
});

const text = new Text({
    position: P(startX + lineGap / 2, startY - defaultTimeUnit),
    text: bold('?'),
    color,
    horizontalAlignment: 'middle',
    verticalAlignment: 'middle',
});

printSVG(polyline, text, ...entityGroups, ...messageGroups);
