import fs from 'fs';

import { execute } from './utility';

const inputDirectory = '/graphics/';
const outputDirectory = '/generated/';

function generateThumbnail(article: string, graphic: string): void {
    fs.mkdirSync(article + '/generated', { recursive: true });
    const input = article + inputDirectory + graphic;
    const output = article + outputDirectory + graphic;
    execute(`node_modules/.bin/ts-node "${input}.svg.ts" thumbnail > "${output}.thumbnail.svg"`,
        () => execute(`node_modules/.bin/svgexport "${output}.thumbnail.svg" "${output}.thumbnail.png" 1200:`),
    );
}

generateThumbnail('.', 'focus');
generateThumbnail('internet', 'signal-relaying-packet-request');
generateThumbnail('internet', 'client-server');
