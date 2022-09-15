/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Path } from '../../../code/svg/elements/path';
import { printSVG } from '../../../code/svg/elements/svg';
import { Text, uppercase } from '../../../code/svg/elements/text';

import { boundingBox, getPath, radius } from './set';

const elements = new Array<VisualElement>();

elements.push(new Path({
    path: getPath(true),
    classes: ['angular'],
    color: 'gray',
    boundingBox,
}));

elements.push(new Path({
    path: getPath(false),
    classes: ['angular', 'alpha'],
    color: 'green',
    boundingBox,
}));

elements.push(new Text({
    position: P(-radius, 0),
    text: '𝔸',
}))

elements.push(new Text({
    position: P(0, 0),
    text: uppercase('lcm'),
    color: 'green',
}))

elements.push(new Text({
    position: P(radius, 0),
    text: '𝔹',
}))

printSVG(...elements);
