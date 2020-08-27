import { execute, File, scan } from './utility';

const inputDirectory = '/graphics/';
const outputDirectory = '/generated/';
const fileSuffix = '.svg.ts';

function callback(file: File): void {
    const name = file.name.slice(0, -7);
    const path = file.pathToInputDirectory + outputDirectory + name;
    execute(`node_modules/.bin/ts-node "${file.path}" embedded > "${path}.embedded.svg"`,
        () => execute(`node_modules/.bin/ts-node "${file.path}" > "${path}.svg"`,
            () => execute(`node_modules/.bin/svgexport "${path}.svg" "${path}.png" 2000:`),
        ),
    );
}

scan(inputDirectory, fileSuffix, callback);
