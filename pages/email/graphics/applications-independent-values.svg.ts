import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, subscript, T } from '../../../code/svg/elements/text';

const seedText = bold('Seed');
const value1Text = T(bold(T('Value', subscript('1'))), ': hash(1 + Seed)');
const value2Text = T(bold(T('Value', subscript('2'))), ': hash(2 + Seed)');
const valueXText = T(bold(T('Value', subscript('X'))), ': hash(X + Seed)');

const horizontalGap = 60;
const verticalGap = 30;
const size = estimateTextSizeWithMargin(valueXText);

const elements = new Array<VisualElement>();

const seedSize = estimateTextSizeWithMargin(seedText);
const seedRectangle = new Rectangle({ position: P(0, 0), size: seedSize });
elements.push(seedRectangle, seedRectangle.text(seedText));

const value1Rectangle = new Rectangle({ position: P(seedSize.x + horizontalGap, -size.y - verticalGap), size });
elements.push(value1Rectangle, value1Rectangle.text(value1Text));

const value2Rectangle = new Rectangle({ position: P(seedSize.x + horizontalGap, 0), size });
elements.push(value2Rectangle, value2Rectangle.text(value2Text));

const valueXRectangle = new Rectangle({ position: P(seedSize.x + horizontalGap, size.y + verticalGap), size });
elements.push(valueXRectangle, valueXRectangle.text(valueXText));

elements.unshift(Line.connectBoxes(seedRectangle, 'right', value1Rectangle, 'left', { color: 'green' }));
elements.unshift(Line.connectBoxes(seedRectangle, 'right', value2Rectangle, 'left', { color: 'green' }));
elements.unshift(Line.connectBoxes(seedRectangle, 'right', valueXRectangle, 'left', { color: 'green' }));
elements.unshift(Line.connectBoxes(value1Rectangle, 'bottom', value2Rectangle, 'top', { color: 'red', marker: ['start', 'end'] }));
elements.unshift(Line.connectBoxes(value2Rectangle, 'bottom', valueXRectangle, 'top', { color: 'red', marker: ['start', 'end'] }));

printSVG(...elements);
