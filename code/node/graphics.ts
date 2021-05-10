/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { execute, File, scan } from './utility';

const inputDirectory = '/graphics/';
const outputDirectory = '/generated/';
const fileSuffix = '.svg.ts';

function callback(file: File): void {
    const name = file.name.slice(0, -7);
    const path = file.pathToInputDirectory + outputDirectory + name;
    execute(`node_modules/.bin/ts-node "${file.path}" embedded > "${path}.embedded.svg"`,
        () => execute(`node_modules/.bin/ts-node "${file.path}" > "${path}.svg"`,
            () => execute(`node_modules/.bin/svgexport "${path}.svg" "${path}.png" 2000:`, undefined, 6),
        ),
    );
}

// The following environment variable didn't solve the problem:
// process.env.SVGEXPORT_TIMEOUT = '120'; // in seconds

scan(inputDirectory, fileSuffix, callback);
