import fs = require('fs');

const color = '#375A7F';

const inverted = false;
const background = false;

const circle = 600;
const border = 0;
const size = circle + 2 * border;
const center = size / 2;
const radius = circle / 8;
const padding = radius / 3;

const svg = `<svg width="${ size }" height="${ size }" xmlns="http://www.w3.org/2000/svg">
    <desc>Explained from First Principles Logo</desc>
    ${ background ?
        `<rect fill="${ color }" width="${ size }" height="${ size }" x="0" y="0" />
    ` : ``}<mask id="mask">
        <circle cx="${ center }" cy="${ center }" r="${ center - border }" fill="white"/>
        <line x1="${ center - padding - radius }" y1="${ center - padding - radius }" x2="${ center - padding - radius }" y2="${ center + padding + radius }" stroke-width="${ radius * 2 }" stroke-linecap="round" stroke="black"/>
        <circle cx="${ center + padding + radius }" cy="${ center + padding + radius }" r="${ radius }" fill="black"/>
    </mask>
    <circle cx="${ center }" cy="${ center }" r="${ center - border }" fill="${ inverted ? color : 'white' }" mask="url(#mask)"/>
</svg>
`;

fs.writeFileSync('assets/images/logo.svg', svg);
