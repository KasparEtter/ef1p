/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { P } from '../../../code/svg/utility/point';

import { Circle } from '../../../code/svg/elements/circle';
import { G } from '../../../code/svg/elements/group';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, small, TextLine } from '../../../code/svg/elements/text';

const radius = 56;
const verticalGap = 28;
const horizontalGap = radius * 2.35;

const content: TextLine[][] = [
    ['Tabloids', 'cover', 'people'],
    ['Newspapers', 'cover', 'events'],
    ['This blog', 'covers', 'ideas'],
].map(row => {
    return [
        small(row[0]),
        small(row[1]),
        bold(row[2]),
    ];
});

const colors: Color[] = ['yellow', 'orange', 'red'];

printSVG(...content.map((row, index) => G(...new Circle({ center: P(index * horizontalGap, index * verticalGap), radius, color: colors[index] }).withText(row))));
