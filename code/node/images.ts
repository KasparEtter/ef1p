/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import fs from 'fs';

import { execute, File, scan } from './utility';

const inputDirectory = '/images/';
const outputDirectory = '/generated/';
const fileSuffix = '.@(png|jpg)';
const scales = [910, 1820, 2730];

let savedTotal = 0;

function callback(file: File): void {
    const input = file.path;
    if (file.name.endsWith('.png')) {
        const output = file.pathToInputDirectory + outputDirectory + file.name;
        execute(`node_modules/.bin/sharp resize 10000 --fit inside --withoutEnlargement --input "${input}" --output "${output}"`,
            () => {
                const inputSize = fs.statSync(input).size;
                const outputSize = fs.statSync(output).size;
                if (inputSize < outputSize) {
                    execute(`cp "${input}" "${output}"`);
                } else {
                    const saved = inputSize - outputSize;
                    savedTotal += saved;
                    console.log(`Saved: ${Math.round(saved / 1000)} kb; Total: ${Math.round(savedTotal / 1000)} kb; File: ${file.name}`);
                }
            },
        );
    } else {
        for (const scale of scales) {
            const output = file.pathToInputDirectory + outputDirectory + file.name.replace('.jpg', `.${scale}.jpg`);
            execute(`node_modules/.bin/sharp resize ${scale} --fit inside --withoutEnlargement --quality 80 --input "${input}" --output "${output}"`);
        }
    }
}

scan(inputDirectory, fileSuffix, callback);
