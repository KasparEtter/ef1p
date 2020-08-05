import { Color } from '../typescript/utility/color';

import { P } from '../typescript/svg/utility/point';

import { Circle } from '../typescript/svg/elements/circle';
import { G } from '../typescript/svg/elements/group';
import { printSVG } from '../typescript/svg/elements/svg';
import { bold, small } from '../typescript/svg/elements/text';

const radius = 60;
const gap = radius * 2.5;

const content = [
    ['Tabloids', 'cover', 'people'],
    ['Newspapers', 'cover', 'events'],
    ['This blog', 'covers', 'ideas'],
].map(row => {
    row[0] = small(row[0]);
    row[1] = small(row[1]);
    row[2] = bold(row[2]);
    return row;
});

const colors: Color[] = ['yellow', 'orange', 'red'];

printSVG(...content.map((row, index) => {
    const circle = new Circle({ center: P(index * gap, 0), radius, color: colors[index] });
    const text = circle.text(row);
    return G(circle, text);
}));
