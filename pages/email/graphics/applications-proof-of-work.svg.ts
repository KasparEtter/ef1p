/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeRadius, textToLineDistance } from '../../../code/svg/utility/constants';
import { markerOffset } from '../../../code/svg/utility/marker';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, Text } from '../../../code/svg/elements/text';

const contentText = bold('Content');
const hash1Text = 'hash(Content + 1)';
const hash2Text = 'hash(Content + 2)';
const hash3Text = 'hash(Content + 3)';
const hashXText = 'hash(Content + X)';

const horizontalGap = 90;
const outputRange = 120;
const rejectRatio = 0.8;
const boundary = 5;

const hash2 = outputRange * (1 - rejectRatio) / 2;
const hashX = outputRange * (1 + rejectRatio) / 2;
const hash1 = hash2 + outputRange * rejectRatio / 3;
const hash3 = hash1 + outputRange * rejectRatio / 3;

const elements = new Array<VisualElement>();

const contentSize = estimateTextSizeWithMargin(contentText);
const contentRectangle = new Rectangle({ position: P(-horizontalGap - contentSize.x, (outputRange - contentSize.y) / 2), size: contentSize });
elements.push(...contentRectangle.withText(contentText));

const classes = 'angular'
elements.push(new Line({ start: P(0, 0), end: P(0, outputRange * rejectRatio), color: 'red', classes }));
elements.push(new Line({ start: P(0, outputRange * rejectRatio), end: P(0, outputRange), color: 'green', classes }));
elements.push(new Line({ start: P(-boundary, 0), end: P(boundary, 0) }));
elements.push(new Line({ start: P(-boundary, outputRange), end: P(boundary, outputRange) }));

const start = contentRectangle.boundingBox().pointAt('right', markerOffset([], 'start'));
elements.unshift(new Line({ start, end: P(-strokeRadius, hashX), marker: 'end', color: 'green'}));
elements.unshift(new Line({ start, end: P(-strokeRadius, hash1), marker: 'end', color: 'red'}));
elements.unshift(new Line({ start, end: P(-strokeRadius, hash2), marker: 'end', color: 'red'}));
elements.unshift(new Line({ start, end: P(-strokeRadius, hash3), marker: 'end', color: 'red'}));

elements.push(new Text({ position: P(textToLineDistance, hash1), text: hash1Text, verticalAlignment: 'center', color: 'red' }));
elements.push(new Text({ position: P(textToLineDistance, hash2), text: hash2Text, verticalAlignment: 'center', color: 'red' }));
elements.push(new Text({ position: P(textToLineDistance, hash3), text: hash3Text, verticalAlignment: 'center', color: 'red' }));
elements.push(new Text({ position: P(textToLineDistance, hashX), text: hashXText, verticalAlignment: 'center', color: 'green' }));

printSVG(...elements);
