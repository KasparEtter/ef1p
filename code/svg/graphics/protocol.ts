/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../utility/color';
import { normalizeToArray } from '../../utility/functions';

import { lineHeight, strokeRadius, textToLineDistance } from '../utility/constants';
import { P, Point, zeroPoint } from '../utility/point';
import { rotate } from '../utility/transform';

import { G, Group } from '../elements/group';
import { Line } from '../elements/line';
import { Rectangle } from '../elements/rectangle';
import { printSVG } from '../elements/svg';
import { bold, estimateTextSizeWithMargin, Text, TextLine } from '../elements/text';

export const defaultHorizontalGap = 238;
export const defaultVerticalGap = 20;
export const defaultTimeUnit = lineHeight + defaultVerticalGap;

export interface Entity {
    text: TextLine | TextLine[];
    color?: Color;
}

export interface Message {
    from: number;
    to: number;
    text: TextLine | TextLine[];
    color?: Color;

    /**
     * How many time units it takes to deliver the message. The default is 0.
     */
    latency?: number;

    /**
     * How many time units this message is delayed. The default is 0.
     */
    delay?: number;
    textOffset?: Point;
}

function textHeight(message: Message, verticalGap: number): number {
    return verticalGap +
        normalizeToArray(message.text).length * lineHeight +
        (message.delay ?? 0) * (lineHeight + verticalGap);
}

function arrowHeight(message: Message, verticalGap: number): number {
    return (message.latency ?? 0) * (lineHeight + verticalGap);
}

export function generateProtocol(
    entities: Entity[] | string[],
    messages: Message[],
    distance = defaultHorizontalGap,
    verticalGap = defaultVerticalGap,
): [Group[], Group[]] {
    if (typeof entities[0] === 'string') {
        entities = (entities as string[]).map(text => ({ text: bold(text) }));
    }
    entities = entities as Entity[];
    const size = Point.max(entities.map(entity => estimateTextSizeWithMargin(entity.text)));
    const overallTime = messages.reduce((time, message) => time + textHeight(message, verticalGap) + arrowHeight(message, verticalGap), 0);
    const entityGroups = entities.map((entity, index) => {
        const rectangle = new Rectangle({ position: P(index * distance - size.x / 2, 0), size, color: entity.color });
        const label = rectangle.text(entity.text);
        const bottom = rectangle.boundingBox().pointAt('bottom');
        const line = new Line({ start: bottom, end: bottom.addY(overallTime + textToLineDistance), color: entity.color });
        return G(rectangle, label, line);
    });
    let y = size.y;
    const messageGroups = messages.map(message => {
        y += textHeight(message, verticalGap);
        const start = P(message.from * distance, y);
        y += arrowHeight(message, verticalGap);
        const end = P(message.to * distance, y);
        const line = new Line({ start, end, marker: ['middle', 'end'], color: message.color }).shorten(0, strokeRadius);
        const position = line.center().subtractY(textToLineDistance).add(message.textOffset ?? zeroPoint);
        const transform = message.latency ? rotate(position, end.subtract(start).angleInDegrees()) : undefined;
        const text = new Text({
            position,
            text: message.text,
            horizontalAlignment: 'middle',
            verticalAlignment: 'bottom',
            color: message.color,
            transform,
        });
        return G(line, text);
    });
    return [entityGroups, messageGroups];
}

export function printProtocol(
    entities: Entity[] | string[],
    messages: Message[],
    distance = defaultHorizontalGap,
    verticalGap = defaultVerticalGap,
): void {
    const [entityGroups, messageGroups] = generateProtocol(entities, messages, distance, verticalGap);
    printSVG(...entityGroups, ...messageGroups);
}
