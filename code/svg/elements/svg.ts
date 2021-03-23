import path from 'path';

import { colors, Theme } from '../../utility/color';

import { Collector } from '../utility/collector';
import { indentation, strokeRadiusMargin, strokeWidth } from '../utility/constants';
import { getArrowMarkers, getCircleMarkers } from '../utility/definitions';
import { round3 } from '../utility/math';
import { P } from '../utility/point';

import { ElementWithChildren, StructuralElement, StructuralElementProps } from './element';

interface SVGProps extends StructuralElementProps {
    title?: string;
    description?: string;
    embedded?: boolean;
    thumbnail?: boolean;
}

const thumbnailRatio = 1.91;
const thumbnailMargin = 0.075;

export class SVG extends StructuralElement<SVGProps> {
    protected _encode(collector: Collector, prefix: string, {
        title,
        description,
        embedded = process.argv[2] === 'embedded',
        thumbnail = process.argv[2] === 'thumbnail',
    }: SVGProps): string {
        const name = path.basename(process.argv[1], '.svg.ts');
        const clippingBox = this.clippingBox();
        if (clippingBox === undefined) {
            throw Error(`The clipping box of the SVG is undefined.`);
        }
        let box = clippingBox.addMargin(strokeRadiusMargin).round3();
        let size = box.size();
        let margin = 0;

        if (thumbnail) {
            collector.theme = 'dark';
            collector.classes.add('filled');
            const originalRatio = size.x / size.y;
            if (originalRatio < thumbnailRatio) {
                // The picture is too high.
                const dy = size.y * thumbnailMargin * thumbnailRatio;
                const dx = ((size.y + 2 * dy) * thumbnailRatio - size.x) / 2;
                box = box.addMargin(P(dx, dy)).round3();
                margin = dy;
            } else {
                // The picture is too wide.
                const dx = size.x * thumbnailMargin;
                const dy = ((size.x + 2 * dx) / thumbnailRatio - size.y) / 2;
                box = box.addMargin(P(dx, dy)).round3();
                margin = dx;
            }
            size = box.size();
        }

        collector.elements.add('svg');
        let result = prefix + `<svg`
            + (embedded ? ` id="figure-${name}"` : '')
            + (embedded ? ` class="figure"` : '')
            + (embedded ? ` data-name="${name}"` : '')
            + ` width="${size.x}"`
            + ` height="${size.y}"`
            + ` viewBox="${box.topLeft.x} ${box.topLeft.y} ${size.x} ${size.y}"`
            + ` preserveAspectRatio="xMidYMid"`
            + ` xmlns="http://www.w3.org/2000/svg">\n`;

        if (title) {
            result += prefix + indentation + `<title>${title}</title>\n`;
        }
        if (description) {
            result += prefix + indentation + `<desc>${description}</desc>\n`;
        }

        // Children add what they need to the collector.
        const children = this.children(collector, prefix);

        if (!embedded) {
            result += `\n`;
            result += prefix + indentation + `<metadata>\n`;
            result += prefix + indentation + indentation + `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:schema="http://schema.org/">\n`;
            result += prefix + indentation + indentation + indentation + `<rdf:Description rdf:about="">\n`;
            result += prefix + indentation + indentation + indentation + indentation + `<schema:author rdf:resource="https://kasparetter.com/"/>\n`;
            result += prefix + indentation + indentation + indentation + indentation + `<schema:license rdf:resource="https://creativecommons.org/licenses/by/4.0/"/>\n`;
            result += prefix + indentation + indentation + indentation + `</rdf:Description>\n`;
            result += prefix + indentation + indentation + `</rdf:RDF>\n`;
            result += prefix + indentation + `</metadata>\n\n`;

            result += prefix + indentation + `<style>`;
            styles.filter(style => style.filter(collector)).forEach(style => {
                result += `\n`;
                result += prefix + indentation + indentation + style.selector;
                if (style.properties) {
                    result += ` {\n`;
                    Object.entries(style.properties).forEach(([key, value]) => {
                        result += prefix + indentation + indentation + indentation + `${key}: ${value};\n`;
                    });
                    result += prefix + indentation + indentation + `}`;
                }
                result += `\n`;
            });
            result += prefix + indentation + `</style>\n`;

            if (collector.arrows.size > 0 || collector.circles.size > 0) {
                result += `\n`;
                result += prefix + indentation + `<defs>\n`;
                result += getArrowMarkers(collector.arrows, prefix + indentation + indentation);
                result += getCircleMarkers(collector.circles, prefix + indentation + indentation);
                result += prefix + indentation + `</defs>\n`;
            }
        }

        if (thumbnail) {
            result += `\n`;
            result += prefix + indentation + `<rect class="filled" x="${box.topLeft.x}" y="${box.topLeft.y}" width="${size.x}" height="${size.y}" style="fill: ${colors.background.dark};"></rect>\n`;
        }

        result += children;

        if (thumbnail) {
            const size = round3(margin);
            const center = round3(size / 2);
            const radius = round3(size / 8);
            const padding = round3(radius / 3);
            const x = round3(box.topLeft.x + size);
            const y = round3(box.bottomRight.y - 2 * size);
            const cx = round3(x + center);
            const cy = round3(y + center);
            result += `\n`;
            result += prefix + indentation + `<mask id="mask">\n`;
            result += prefix + indentation + indentation + `<rect class="filled" x="${x}" y="${y}" width="${size}" height="${size}" style="fill: white;"></rect>\n`;
            result += prefix + indentation + indentation + `<line x1="${round3(cx - padding - radius)}" y1="${round3(cy - padding - radius)}" x2="${round3(cx - padding - radius)}" y2="${round3(cy + padding + radius)}" style="stroke-width: ${round3(radius * 2)}; stroke-linecap: round; stroke: black;"></line>\n`;
            result += prefix + indentation + indentation + `<circle class="filled" cx="${round3(cx + padding + radius)}" cy="${round3(cy + padding + radius)}" r="${radius}" style="fill: black;"></circle>\n`;
            result += prefix + indentation + `</mask>\n`;
            result += prefix + indentation + `<circle class="filled" cx="${cx}" cy="${cy}" r="${center}" style="fill: white;" mask="url(#mask)"/>\n`;
        }

        result += `\n</svg>`;
        return result;
    }

    public print() {
        console.log(this.toString());
    }
}

export function printSVG(...children: ElementWithChildren<any, any>[]): void {
    new SVG({ children }).print();
}

interface Style {
    filter: (collector: Collector) => boolean;
    selector: string;
    properties?: { [key: string]: string };
}

const staticStyles: Style[] = [
    {
        filter: collector => collector.elements.has('text'),
        selector: '@import url("https://fonts.googleapis.com/css?family=Lato:400,700,400italic");',
    },
    {
        filter: collector => collector.elements.has('svg'),
        selector: 'svg',
        properties: {
            'font-family': 'Lato,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
            'font-size': '1rem',
            'font-weight': '400',
            'line-height': '1.5',
        },
    },
    {
        filter: collector => collector.theme === 'dark',
        selector: 'svg',
        properties: {
            'fill': colors.text.dark,
            'stroke': colors.text.dark,
        },
    },
    {
        filter: collector => collector.theme === 'light',
        selector: 'svg',
        properties: {
            'fill': colors.text.light,
            'stroke': colors.text.light,
        },
    },
    {
        filter: collector => collector.elements.has('text'),
        selector: 'text',
        properties: {
            'stroke-opacity': '0',
        },
    },
    {
        filter: collector => collector.elements.has('a') && collector.theme === 'dark',
        selector: 'a',
        properties: {
            'fill': colors.blue.dark,
            'text-decoration': 'none',
        },
    },
    {
        filter: collector => collector.elements.has('a') && collector.theme === 'light',
        selector: 'a',
        properties: {
            'fill': colors.blue.light,
            'text-decoration': 'none',
        },
    },
    {
        filter: collector =>
            collector.elements.has('line') ||
            collector.elements.has('rect') ||
            collector.elements.has('circle') ||
            collector.elements.has('ellipse') ||
            collector.elements.has('polygon') ||
            collector.elements.has('polyline') ||
            collector.elements.has('path'),
        selector: 'line, rect, circle, ellipse, polygon, polyline, path',
        properties: {
            'fill-opacity': '0',
            'stroke-width': strokeWidth.toString(),
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
        },
    },
    {
        filter: collector => collector.arrows.size > 0,
        selector: 'marker > path',
        properties: {
            'fill-opacity': '1',
            'stroke-opacity': '0',
        },
    },
    {
        filter: collector => collector.circles.size > 0,
        selector: 'marker > circle',
        properties: {
            'fill-opacity': '1',
            'stroke-width': '1',
        },
    },
    {
        filter: collector => collector.classes.has('filled'),
        selector: '.filled',
        properties: {
            'fill-opacity': '1',
            'stroke-width': '0',
        },
    },
    {
        filter: collector => collector.classes.has('angular'),
        selector: '.angular',
        properties: {
            'stroke-linecap': 'square',
            'stroke-linejoin': 'miter',
        },
    },
    {
        filter: collector => collector.classes.has('font-weight-bold'),
        selector: '.font-weight-bold',
        properties: {
            'font-weight': 'bold',
        },
    },
    {
        filter: collector => collector.classes.has('font-italic'),
        selector: '.font-italic',
        properties: {
            'font-style': 'italic',
        },
    },
    {
        filter: collector => collector.classes.has('text-underline'),
        selector: '.text-underline',
        properties: {
            'text-decoration': 'underline',
        },
    },
    {
        filter: collector => collector.classes.has('text-line-through'),
        selector: '.text-line-through',
        properties: {
            'text-decoration': 'line-through',
        },
    },
    {
        filter: collector => collector.classes.has('text-uppercase'),
        selector: '.text-uppercase',
        properties: {
            'text-transform': 'uppercase',
        },
    },
    {
        filter: collector => collector.classes.has('text-lowercase'),
        selector: '.text-lowercase',
        properties: {
            'text-transform': 'lowercase',
        },
    },
    {
        filter: collector => collector.classes.has('text-capitalize'),
        selector: '.text-capitalize',
        properties: {
            'text-transform': 'capitalize',
        },
    },
    {
        filter: collector => collector.classes.has('preserve-whitespace'),
        selector: '.preserve-whitespace',
        properties: {
            'white-space': 'pre',
        },
    },
    {
        filter: collector => collector.classes.has('code') && collector.theme === 'dark',
        selector: '.code',
        properties: {
            'font-family': 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            'font-size': '87.5%',
            'fill': colors.pink.dark,
            'white-space': 'pre',
        },
    },
    {
        filter: collector => collector.classes.has('code') && collector.theme === 'light',
        selector: '.code',
        properties: {
            'font-family': 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            'font-size': '87.5%',
            'fill': colors.pink.light,
            'white-space': 'pre',
        },
    },
    {
        filter: collector => collector.classes.has('small'),
        selector: '.small',
        properties: {
            'font-size': '80%',
        },
    },
    {
        filter: collector => collector.classes.has('large'),
        selector: '.large',
        properties: {
            'font-size': '160%',
        },
    },
    {
        filter: collector => collector.classes.has('script'),
        selector: '.script',
        properties: {
            'font-size': '75%',
        },
    },
];

function mapColors(theme: Theme): Style[] {
    return Object.entries(colors).map(color => ({
        filter: collector => collector.theme === theme && collector.classes.has(color[0]),
        selector: '.' + color[0],
        properties: {
            'fill': color[1][theme],
            'stroke': color[1][theme],
        },
    } as Style));
}

const styles: Style[] = staticStyles.concat(mapColors('dark')).concat(mapColors('light'));
