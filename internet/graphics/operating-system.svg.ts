import { Color } from '../../typescript/utility/color';

import { P } from '../../typescript/svg/utility/point';

import { VisualElement } from '../../typescript/svg/elements/element';
import { Line } from '../../typescript/svg/elements/line';
import { Rectangle } from '../../typescript/svg/elements/rectangle';
import { printSVG } from '../../typescript/svg/elements/svg';
import { bold } from '../../typescript/svg/elements/text';

const width = 640;
const rowDistance = 40;
const halfRowDistance = rowDistance / 2;

const elements = new Array<VisualElement>();

['Application process', 'Operating system', 'Network interface'].forEach((layer, index) => {
    const rectangle = new Rectangle({ position: P(0, index * rowDistance), size: P(width, rowDistance), cornerRadius: 0 });
    const text = rectangle.text(bold(layer), { horizontalAlignment: 'left' });
    elements.push(rectangle, text);
});

const color: Color = 'green';

const x1 = 175;
const line1 = new Line({ start: P(x1, halfRowDistance), end: P(x1, halfRowDistance + rowDistance), marker: 'end', color });
const text1 = line1.text(['Please forward to me', 'all traffic on port 25']);
elements.push(line1, text1);

const x2 = x1 + 182;
const line2 = new Line({ start: P(x2, halfRowDistance + 2 * rowDistance), end: P(x2, halfRowDistance + rowDistance), marker: 'end', color });
const text2 = line2.text(['I received a new', 'packet on port 25'], 'right');
elements.push(line2, text2);

const x3 = x2 + 153;
const line3 = new Line({ start: P(x3, halfRowDistance + rowDistance), end: P(x3, halfRowDistance), marker: 'end', color });
const text3 = line3.text(['I have a new', 'packet for you'], 'right');
elements.push(line3, text3);

printSVG(...elements);
