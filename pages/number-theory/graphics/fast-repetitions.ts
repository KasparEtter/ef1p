/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { strokeWidth, textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { Arc } from '../../../code/svg/elements/arc';
import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { bold, Text, TextLine } from '../../../code/svg/elements/text';

export const n = 13;
export const gap = 45;

const smallRadius = gap * 0.4;
export const largeRadius = smallRadius * 2;
const ratio = 0.2;

const dashRadius = 2 * strokeWidth;
export const textOffset = dashRadius + textToLineDistance;

export const fastRepetitionsElements = new Array<VisualElement>();
fastRepetitionsElements.push(new Line({ start: P(gap, 0), end: P(n * gap, 0) }));

for (let i = 1; i < n; i++) {
    fastRepetitionsElements.push(new Arc({
        start: P(i * gap, -dashRadius),
        startSide: 'top',
        end: P((i + 1) * gap, -dashRadius),
        endSide: 'top',
        radius: smallRadius,
        ratio,
        marker: 'end',
        color: 'blue',
    }));
}

export function addLabel(i: number, text: TextLine): void {
    fastRepetitionsElements.push(new Text({ position: P(i * gap, textOffset), text: bold(text), verticalAlignment: 'top' }));
}

function addArc(start: number, end: number, text: TextLine): void {
    fastRepetitionsElements.push(...new Arc({
        start: P(start * gap, -dashRadius),
        startSide: 'top',
        end: P(end * gap, -dashRadius),
        endSide: 'top',
        radius: largeRadius,
        marker: 'end',
        color: 'green',
    }).withText(text));
}

export function addArcs(doubleText: TextLine, incrementText: TextLine): void {
    addArc(1, 2, doubleText);
    addArc(2, 3, incrementText);
    addArc(3, 6, doubleText);
    addArc(6, 12, doubleText);
    addArc(12, 13, incrementText);
}

export function addDashes(): void {
    for (let i = 1; i <= n; i++) {
        fastRepetitionsElements.push(new Line({
            start: P(i * gap, -dashRadius),
            end: P(i * gap, dashRadius),
        }));
    }
}
