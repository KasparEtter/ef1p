/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeWidth } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold } from '../../../code/svg/elements/text';

import { a, arrowOffset, b, dashRadius, gcd, max, scale } from './bezouts-identity.svg';

const elements = new Array<VisualElement>();

elements.push(new Line({
    start: P(0, 0),
    end: P(max * scale, 0),
    marker: 'end',
}));

elements.push(...new Line({ start: P(0, -arrowOffset), end: P(gcd * scale, -arrowOffset), marker: ['start', 'end'], color: 'pink' }).withText(bold('gcd')));
elements.push(...new Line({ start: P(0, arrowOffset), end: P(a * scale, arrowOffset), marker: 'end', color: 'blue' }).withText(bold('+ a'), 'right'));
elements.push(...new Line({ start: P(a * scale, arrowOffset), end: P(2 * a * scale, arrowOffset), marker: 'end', color: 'blue' }).withText(bold('+ a'), 'right'));
elements.push(...new Line({ start: P(2 * a * scale, -arrowOffset), end: P((2 * a - b) * scale, -arrowOffset), marker: 'end', color: 'green' }).withText(bold('− b'), 'right'));

for (let i = 0; i < max; i++) {
    elements.push(new Line({
        start: P(i * scale, strokeWidth / 2),
        end: P(i * scale, dashRadius),
    }));
}

for (let i = 0; i < max; i += gcd) {
    elements.push(new Line({
        start: P(i * scale, -strokeWidth / 2),
        end: P(i * scale, -dashRadius),
    }));
}

printSVG(...elements);
