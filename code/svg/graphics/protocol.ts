import { Color } from '../../utility/color';

import { doubleTextMargin, getTextHeight, strokeRadius } from '../utility/constants';
import { P, Point, zeroPoint } from '../utility/point';
import { rotate } from '../utility/transform';

import { G, Group } from '../elements/group';
import { Line } from '../elements/line';
import { Rectangle } from '../elements/rectangle';
import { printSVG } from '../elements/svg';
import { bold, estimateWidth, Text, TextLine } from '../elements/text';

export interface Entity {
    text: TextLine;
    color?: Color;
}

export interface Message {
    from: number;
    to: number;
    text: TextLine;
    color?: Color;
    latency?: number; // How many time units it takes to deliver the message. (The default is 0.)
    delay?: number; // How much subsequent messages are delayed. (The default is 0.)
    textOffset?: Point;
}

export const textHeight = 40;
export const textOffset = 10;

function timeIncrement(message: Message): number {
    return 1 + (message.latency ?? 0) + (message.delay ?? 0);
}

export function generateProtocol(
    entities: Entity[] | string[],
    messages: Message[],
    distance: number = 238,
): [Group[], Group[]] {
    if (typeof entities[0] === 'string') {
        entities = (entities as string[]).map(text => ({ text: bold(text) }));
    }
    entities = entities as Entity[];
    const size = P(estimateWidth(entities.map(entity => entity.text)), getTextHeight(1)).add(doubleTextMargin);
    const overallTime = messages.reduce((time, message) => time + timeIncrement(message), 0);
    const entityGroups = entities.map((entity, index) => {
        const rectangle = new Rectangle({ position: P(index * distance - size.x / 2, 0), size, color: entity.color });
        const label = rectangle.text(entity.text);
        const bottom = rectangle.boundingBox().pointAt('bottom');
        const line = new Line({ start: bottom, end: bottom.addY(overallTime * textHeight + textOffset), color: entity.color });
        return G(rectangle, label, line);
    });
    let time = 1;
    const messageGroups = messages.map(message => {
        const y = size.y + time * textHeight;
        const start = P(message.from * distance, y);
        const end = P(message.to * distance, y + (message.latency ?? 0) * textHeight);
        time += timeIncrement(message);
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
