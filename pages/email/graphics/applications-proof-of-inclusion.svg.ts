/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { doubleTextMargin, getTextHeight } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, subscript, T } from '../../../code/svg/elements/text';

// Constants

const leaf1Text = bold(T('Leaf', subscript('1')));
const leaf2Text = bold(T('Leaf', subscript('2')));
const leaf3Text = bold(T('Leaf', subscript('3')));
const leaf4Text = bold(T('Leaf', subscript('4')));
const node1Text = T(bold(T('Node', subscript('1'))), ': hash(Leaf', subscript('1'), ')');
const node2Text = T(bold(T('Node', subscript('2'))), ': hash(Leaf', subscript('2'), ')');
const node3Text = T(bold(T('Node', subscript('3'))), ': hash(Leaf', subscript('3'), ')');
const node4Text = T(bold(T('Node', subscript('4'))), ': hash(Leaf', subscript('4'), ')');
const node5Text = T(bold(T('Node', subscript('5'))), ': hash(Node', subscript('1'), ' + Node', subscript('2'), ')');
const node6Text = T(bold(T('Node', subscript('6'))), ': hash(Node', subscript('3'), ' + Node', subscript('4'), ')');
const rootText = T(bold('Root'), ': hash(Node', subscript('5'), ' + Node', subscript('6'), ')');

const computeColor = 'green';
const provideColor = 'blue';

const horizontalGap = 40;
const verticalGap = horizontalGap / 2;
const rectangleHeight = getTextHeight(1) + doubleTextMargin.y;

const leaf1Size = estimateTextSizeWithMargin(leaf1Text);
const node1Size = estimateTextSizeWithMargin(node1Text);
const node5Size = estimateTextSizeWithMargin(node5Text);
const rootSize = estimateTextSizeWithMargin(rootText);

const elements = new Array<VisualElement>();

// Leafs

const heightAndGap = rectangleHeight + verticalGap;

const leaf1Rectangle = new Rectangle({ position: P(0, 0 * heightAndGap), size: leaf1Size });
elements.push(leaf1Rectangle, leaf1Rectangle.text(leaf1Text));

const leaf2Rectangle = new Rectangle({ position: P(0, 1 * heightAndGap), size: leaf1Size, color: computeColor });
elements.push(leaf2Rectangle, leaf2Rectangle.text(leaf2Text));

const leaf3Rectangle = new Rectangle({ position: P(0, 2 * heightAndGap), size: leaf1Size });
elements.push(leaf3Rectangle, leaf3Rectangle.text(leaf3Text));

const leaf4Rectangle = new Rectangle({ position: P(0, 3 * heightAndGap), size: leaf1Size });
elements.push(leaf4Rectangle, leaf4Rectangle.text(leaf4Text));

// Nodes level 1

const level1X = leaf1Size.x + horizontalGap;

const node1Rectangle = new Rectangle({ position: P(level1X, 0 * heightAndGap), size: node1Size, color: provideColor });
elements.push(node1Rectangle, node1Rectangle.text(node1Text));

const node2Rectangle = new Rectangle({ position: P(level1X, 1 * heightAndGap), size: node1Size, color: computeColor });
elements.push(node2Rectangle, node2Rectangle.text(node2Text));

const node3Rectangle = new Rectangle({ position: P(level1X, 2 * heightAndGap), size: node1Size });
elements.push(node3Rectangle, node3Rectangle.text(node3Text));

const node4Rectangle = new Rectangle({ position: P(level1X, 3 * heightAndGap), size: node1Size });
elements.push(node4Rectangle, node4Rectangle.text(node4Text));

// Nodes level 2

const level2X = level1X + node1Size.x + horizontalGap;

const node5Rectangle = new Rectangle({ position: P(level2X, 0.5 * heightAndGap), size: node5Size, color: computeColor });
elements.push(node5Rectangle, node5Rectangle.text(node5Text));

const node6Rectangle = new Rectangle({ position: P(level2X, 2.5 * heightAndGap), size: node5Size, color: provideColor });
elements.push(node6Rectangle, node6Rectangle.text(node6Text));

// Root

const rootX = level2X + node5Size.x + horizontalGap;

const rootRectangle = new Rectangle({ position: P(rootX, 1.5 * heightAndGap), size: rootSize, color: computeColor });
elements.push(rootRectangle, rootRectangle.text(rootText));

// Arrows

elements.unshift(Line.connectBoxes(leaf1Rectangle, 'right', node1Rectangle, 'left'));
elements.unshift(Line.connectBoxes(leaf2Rectangle, 'right', node2Rectangle, 'left', { color: computeColor }));
elements.unshift(Line.connectBoxes(leaf3Rectangle, 'right', node3Rectangle, 'left'));
elements.unshift(Line.connectBoxes(leaf4Rectangle, 'right', node4Rectangle, 'left'));

elements.unshift(Line.connectBoxes(node1Rectangle, 'right', node5Rectangle, 'left', { color: provideColor }));
elements.unshift(Line.connectBoxes(node2Rectangle, 'right', node5Rectangle, 'left', { color: computeColor }));

elements.unshift(Line.connectBoxes(node3Rectangle, 'right', node6Rectangle, 'left'));
elements.unshift(Line.connectBoxes(node4Rectangle, 'right', node6Rectangle, 'left'));

elements.unshift(Line.connectBoxes(node5Rectangle, 'right', rootRectangle, 'left', { color: computeColor }));
elements.unshift(Line.connectBoxes(node6Rectangle, 'right', rootRectangle, 'left', { color: provideColor }));

printSVG(...elements);
