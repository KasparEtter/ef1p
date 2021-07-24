/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, colorize, estimateTextSizeWithMargin } from '../../../code/svg/elements/text';

const producerText = ['Content', 'producer'].map(bold);
const providerText = ['Storage', 'provider'].map(bold);
const consumerText = [bold('Consumer'), colorize('pink', 'hash(File) = Hash?')];
const fileText = 'File';
const fileColor = 'blue'
const hashText = 'Hash';
const hashColor = 'green';

const size = estimateTextSizeWithMargin(providerText);
const gap = 20;

const elements = new Array<VisualElement>();

const producerRectangle = new Rectangle({ position: P(0, 0), size });
elements.push(...producerRectangle.withText(producerText));

const providerRectangle = new Rectangle({ position: P(size.x + gap, -2 * size.y), size });
elements.push(...providerRectangle.withText(providerText));

const consumerSize = estimateTextSizeWithMargin(consumerText);
const consumerRectangle = new Rectangle({ position: P(2 * size.x + 2 * gap, 0), size: consumerSize });
elements.push(...consumerRectangle.withText(consumerText));

elements.unshift(...Line.connectBoxes(producerRectangle, 'right', providerRectangle, 'bottom', { color: fileColor }).withText(fileText));
elements.unshift(...Line.connectBoxes(providerRectangle, 'bottom', consumerRectangle, 'left', { color: fileColor }).withText(fileText));
elements.unshift(...Line.connectBoxes(producerRectangle, 'right', consumerRectangle, 'left', { color: hashColor }).withText(hashText, 'right'));

printSVG(...elements);
