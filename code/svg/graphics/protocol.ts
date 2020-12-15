import { Color } from '../../utility/color';
import { normalizeToArray } from '../../utility/functions';

import { lineHeight, strokeRadius } from '../utility/constants';
import { P, Point, zeroPoint } from '../utility/point';
import { rotate } from '../utility/transform';

import { G, Group } from '../elements/group';
import { Line } from '../elements/line';
import { Rectangle } from '../elements/rectangle';
import { printSVG } from '../elements/svg';
import { bold, estimateSizeWithMargin, Text, TextLine } from '../elements/text';

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

export const textOffset = 10;

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
    distance: number = 238,
    verticalGap: number = 18,
): [Group[], Group[]] {
    if (typeof entities[0] === 'string') {
        entities = (entities as string[]).map(text => ({ text: bold(text) }));
    }
    entities = entities as Entity[];
    const size = Point.max(entities.map(entity => estimateSizeWithMargin(entity.text)));
    const overallTime = messages.reduce((time, message) => time + textHeight(message, verticalGap) + arrowHeight(message, verticalGap), 0);
    const entityGroups = entities.map((entity, index) => {
        const rectangle = new Rectangle({ position: P(index * distance - size.x / 2, 0), size, color: entity.color });
        const label = rectangle.text(entity.text);
        const bottom = rectangle.boundingBox().pointAt('bottom');
        const line = new Line({ start: bottom, end: bottom.addY(overallTime + textOffset), color: entity.color });
        return G(rectangle, label, line);
    });
    let y = size.y;
    const messageGroups = messages.map(message => {
        y += textHeight(message, verticalGap);
        const start = P(message.from * distance, y);
        y += arrowHeight(message, verticalGap);
        const end = P(message.to * distance, y);
        const line = new Line({ start, end, marker: ['middle', 'end'], color: message.color }).shorten(0, strokeRadius);
        const position = line.center().subtractY(textOffset).add(message.textOffset ?? zeroPoint);
        const transform = message.latency ? rotate(end.subtract(start), position) : undefined;
        const text = new Text({
            position,
            text: message.text,
            horizontalAlignment: 'center',
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
    distance: number = 238,
): void {
    const [entityGroups, messageGroups] = generateProtocol(entities, messages, distance);
    printSVG(...entityGroups, ...messageGroups);
}
