import { Color } from '../typescript/utility/color';

import { P } from '../typescript/svg/utility/point';

import { Circle } from '../typescript/svg/elements/circle';
import { G } from '../typescript/svg/elements/group';
import { printSVG } from '../typescript/svg/elements/svg';
import { bold, small, TextLine } from '../typescript/svg/elements/text';

const radius = 60;
const verticalGap = 34;
const horizontalGap = radius * 2.5;

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

printSVG(...content.map((row, index) => {
    const circle = new Circle({ center: P(index * horizontalGap, index * verticalGap), radius, color: colors[index] });
    const text = circle.text(row);
    return G(circle, text);
}));
