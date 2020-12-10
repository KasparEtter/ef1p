import fs from 'fs';

import { execute } from './utility';

function generateThumbnail(pageDirectory: string, graphicName: string): void {
    const inputDirectory = 'pages/' + pageDirectory + '/graphics/';
    const outputDirectory = 'pages/' + pageDirectory + '/generated/';
    fs.mkdirSync(outputDirectory, { recursive: true });
    execute(`node_modules/.bin/ts-node "${inputDirectory}${graphicName}.svg.ts" thumbnail > "${outputDirectory}thumbnail.svg"`,
        () => execute(`node_modules/.bin/svgexport "${outputDirectory}thumbnail.svg" "${outputDirectory}thumbnail.png" 1200:`,
            // Only necessary because Jekyll can't include files from other directories.
            () => execute(`cp "${outputDirectory}${graphicName}.embedded.svg" "pages/index/thumbnails/${pageDirectory}.svg"`),
        ),
    );
}

generateThumbnail('index', 'focus');
generateThumbnail('error', 'page-not-found');
generateThumbnail('tools', 'client-server');
generateThumbnail('internet', 'signal-relaying-packet-request');
