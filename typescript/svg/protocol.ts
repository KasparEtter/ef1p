import { P } from './utility/point';

import { Group } from './elements/group';
import { Line } from './elements/line';
import { Rectangle } from './elements/rectangle';
import { determineHeight, estimateSize, estimateWidth } from './elements/text';

export interface Message {
    from: number;
    to: number;
    text: string;
}

export function Protocol(
    entities: string[],
    messages: Message[],
): Group {
    const texts = messages.map(message => message.text);
    const textWidth = estimateWidth(texts) * 1.5;
    const textHeight = determineHeight('') * 2;
    const rectangles = entities.map((entity, index) => {
        const size = estimateSize(entity);

        return new Rectangle({ position: P(index * textWidth, 0), size });
    });
    const labels = rectangles.map((rectangle, index) => rectangle.text(entities[index]));
    const lines = rectangles.map(rectangle => new Line({ start: rectangle.boundingBox().point('bottom'), end: rectangle.boundingBox().point('bottom').addY(messages.length * textHeight) }));
    return new Group({ children: [...rectangles, ...labels, ...lines] });
}
