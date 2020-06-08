import path from 'path';

import { Color, colors, colorSuffix } from '../utility/color';
import { strokeRadiusMargin } from '../utility/constants';

import { ElementWithChildren, indentation, StructuralElement, StructuralElementProps } from './element';

interface SVGProps extends StructuralElementProps {
    title?: string;
    description?: string;
    embedded?: boolean;
}

export class SVG extends StructuralElement<SVGProps> {
    protected _encode(prefix: string, {
        title,
        description,
        embedded = process.argv[2] === 'embedded',
    }: SVGProps): string {
        const name = path.basename(process.argv[1], '.ts');
        const box = this.boundingBox().addMargin(strokeRadiusMargin);
        const size = box.size();

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
        result += '\n';

        if (!embedded) {
            result += prefix + indentation + `<metadata>\n`;
            result += prefix + indentation + indentation + `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:schema="http://schema.org/">\n`;
            result += prefix + indentation + indentation + indentation + `<rdf:Description rdf:about="">\n`;
            result += prefix + indentation + indentation + indentation + indentation + `<schema:author rdf:resource="https://www.kasparetter.com/"/>\n`;
            result += prefix + indentation + indentation + indentation + indentation + `<schema:license rdf:resource="https://creativecommons.org/licenses/by/4.0/"/>\n`;
            result += prefix + indentation + indentation + indentation + indentation + `<schema:dateModified>${new Date().toISOString().slice(0, 16) + 'Z'}</schema:dateModified>\n`;
            result += prefix + indentation + indentation + indentation + `</rdf:Description>\n`;
            result += prefix + indentation + indentation + `</rdf:RDF>\n`;
            result += prefix + indentation + `</metadata>\n\n`;
            result += prefix + indentation + style;
        }

        result += prefix + indentation + `<defs>\n`;
        for (const color of [undefined, ...Object.keys(colors)] as (Color | undefined)[]) {
            result += prefix + indentation + indentation + `<marker id="arrow${colorSuffix(color)}" orient="auto-start-reverse" markerWidth="4" markerHeight="4" refX="4" refY="2">\n`;
            result += prefix + indentation + indentation + indentation + `<path d="M0,0 L1,2 L0,4 L4,2 Z"${color ? ' class="' + color + '"' : ''} />\n`;
            result += prefix + indentation + indentation + `</marker>\n`;
            result += prefix + indentation + indentation + `<marker id="circle${colorSuffix(color)}" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5">\n`;
            result += prefix + indentation + indentation + indentation + `<circle cx="1.5" cy="1.5" r="1"${color ? ' class="' + color + '"' : ''} />\n`;
            result += prefix + indentation + indentation + `</marker>\n`;
        }
        result += prefix + indentation + `</defs>\n`;

        result += this.children(prefix) + `</svg>\n`;
        return result;
    }

    public print() {
        // tslint:disable-next-line: no-console
        console.log(this.toString());
    }
}

export function printSVG(...children: ElementWithChildren<any, any>[]): void {
    new SVG({ children }).print();
}

export const style = `<style>
        @import url("https://fonts.googleapis.com/css?family=Lato:400,700,400italic");

        svg {
            fill: black;
            stroke: black;
            font-family: Lato,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
        }

        text {
            stroke-opacity: 0;
        }

        line, rect, circle, ellipse, polygon, polyline, path {
            fill-opacity: 0;
            stroke-width: 3px;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .angular {
            stroke-linecap: square;
            stroke-linejoin: miter;
        }

        marker > path {
            fill-opacity: 1;
            stroke-opacity: 0;
        }

        marker > circle {
            fill-opacity: 1;
            stroke-width: 1px;
        }

        .font-weight-bold {
            font-weight: bold;
        }

        .font-italic {
            font-style: italic;
        }

        .text-underline {
            text-decoration: underline;
        }

        .text-line-through {
            text-decoration: line-through;
        }

        .small {
            font-size: 80%;
        }

        a {
            color: #3498db;
            text-decoration: none;
        }
` + Object.entries(colors).map(color => `
        .${color[0]} {
            fill: ${color[1]};
            stroke: ${color[1]};
        }
`).join('') + `    </style>

`;
