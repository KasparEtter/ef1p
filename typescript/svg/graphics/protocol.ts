import { Color } from '../utility/color';
import { strokeRadius } from '../utility/constants';
import { P, Point, zeroPoint } from '../utility/point';

import { Group } from '../elements/group';
import { Line } from '../elements/line';
import { Rectangle } from '../elements/rectangle';
import { printSVG } from '../elements/svg';
import { estimateSize, estimateWidth, Text } from '../elements/text';

export interface Message {
    from: number;
    to: number;
    text: string;
    color?: Color;
    latency?: number; // How many time units it takes to deliver the message. (The default is 0.)
    delay?: number; // How much subsequent messages are delayed. (The default is 0.)
    textOffset?: Point;
}

function timeIncrement(message: Message): number {
    return 1 + (message.latency ?? 0) + (message.delay ?? 0);
}

export function printProtocol(
    entities: string[],
    messages: Message[],
): void {
    const size = entities.reduce((size, entity) => size.max(estimateSize(entity)), zeroPoint);
    const texts = messages.map(message => message.text);
    const textWidth = estimateWidth(texts) * 2;
    const textHeight = 40;
    const textOffset = 10;
    const overallTime = messages.reduce((time, message) => time + timeIncrement(message), 0);
    const entityGroups = entities.map((entity, index) => {
        const rectangle = new Rectangle({ position: P(index * textWidth - size.x / 2, 0), size });
        const label = rectangle.text(entity);
        const bottom = rectangle.boundingBox().pointAt('bottom');
        const line = new Line({ start: bottom, end: bottom.addY(overallTime * textHeight + textOffset) });
        return new Group({ children: [rectangle, label, line] })
    });
    let time = 1;
    const messageGroups = messages.map(message => {
        const y = size.y + time * textHeight;
        const start = P(message.from * textWidth, y);
        const end = P(message.to * textWidth, y + (message.latency ?? 0) * textHeight);
        time += timeIncrement(message);
        const line = new Line({ start, end, marker: ['middle', 'end'], color: message.color }).shorten(0, strokeRadius);
        const text = new Text({
            position: line.center().subtractY(textOffset * (1 + (message.latency ?? 0) / 2)).add(message.textOffset ?? zeroPoint),
            text: message.text,
            horizontalAlignment: 'center',
            verticalAlignment: 'bottom',
            color: message.color,
        });
        return new Group({ children: [line, text] })
    });
    printSVG(...entityGroups, ...messageGroups);
}
