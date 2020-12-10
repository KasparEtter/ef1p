import { Color, Theme } from '../../utility/color';

export interface Collector {
    theme: Theme;
    elements: Set<string>;
    classes: Set<string>;
    circles: Set<Color | undefined>;
    arrows: Set<Color | undefined>;
}

export function createEmptyCollector(): Collector {
    return {
        theme: 'light',
        elements: new Set(),
        classes: new Set(),
        circles: new Set(),
        arrows: new Set(),
    };
}
