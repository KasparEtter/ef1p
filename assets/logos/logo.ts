// Run this script with `npm run logo-build`.
import fs from 'fs';

const color = '#0D4073';

const square = false;
const inverted = false;
const background = false;

const circle = 600;
const border = 0;
const size = circle + 2 * border;
const center = size / 2;
const radius = circle / 8;
const padding = radius / 3;

const svg = `<svg width="${ size }" height="${ size }" xmlns="http://www.w3.org/2000/svg">
    <title>Explained from First Principles Logo</title>
    ${ background ?
        `<rect x="0" y="0" width="${ size }" height="${ size }" fill="${ inverted ? 'white' : color }"/>
    ` : ``}<mask id="mask">
        <rect x="0" y="0" width="${ size }" height="${ size }" fill="white"/>
        <line x1="${ center - padding - radius }" y1="${ center - padding - radius }" x2="${ center - padding - radius }" y2="${ center + padding + radius }" stroke-width="${ radius * 2 }" stroke-linecap="round" stroke="black"/>
        <circle cx="${ center + padding + radius }" cy="${ center + padding + radius }" r="${ radius }" fill="black"/>
    </mask>
    ${ square ?
        `<rect x="0" y="0" width="${ size }" height="${ size }" fill="${ inverted ? color : 'white' }" mask="url(#mask)"/>` :
        `<circle cx="${ center }" cy="${ center }" r="${ center - border }" fill="${ inverted ? color : 'white' }" mask="url(#mask)"/>`
    }
</svg>
`;

fs.writeFileSync('assets/logos/logo.svg', svg);
