/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { lineHeight, strokeRadiusMargin, strokeWidthMargin } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, Text } from '../../../code/svg/elements/text';

const gcd = 3;
const repetitions = [3, 2, 2];
const sizes = [0, gcd];

for (const repetition of repetitions) {
    sizes.push(sizes[sizes.length - 2] + sizes[sizes.length - 1] * repetition);
}

const scale = 10;
const cornerRadius = 0;
const classes = 'angular';
const colors: Color[] = ['yellow', 'orange', 'red', 'pink', 'purple'];

const elements = new Array<VisualElement>();

let x = 0;
let y = 0;

const rectangle = new Rectangle({
    position: P(x, y).subtract(strokeRadiusMargin),
    size: P(
        sizes[sizes.length - 1] * scale,
        sizes[sizes.length - 2] * scale,
    ).add(strokeWidthMargin),
    color: colors[sizes.length - 2],
    cornerRadius,
    classes,
});
elements.push(rectangle);

const box = rectangle.boundingBox();
elements.push(new Text({
    position: box.pointAt('bottom').addY(lineHeight),
    text: bold(sizes[sizes.length - 1].toString()),
    color: colors[sizes.length - 2],
    verticalAlignment: 'top',
}));
elements.push(new Text({
    position: box.pointAt('left').subtractX(lineHeight),
    text: bold(sizes[sizes.length - 2].toString()),
    color: colors[sizes.length - 2],
    horizontalAlignment: 'right',
}));

for (let r = repetitions.length - 1; r >= 0; r--) {
    const size = sizes[r + 1];
    for (let i = 0; i < repetitions[r]; i++) {
        const rectangle = new Rectangle({
            position: P(x * scale, y * scale).add(strokeRadiusMargin),
            size: P(size * scale, size * scale).subtract(strokeWidthMargin),
            color: colors[r],
            cornerRadius,
            classes,
        });
        elements.push(...rectangle.withText(bold(size.toString())));
        if ((repetitions.length - r) % 2 === 1) {
            x += size;
        } else {
            y += size;
        }
    }
}

printSVG(...elements);
