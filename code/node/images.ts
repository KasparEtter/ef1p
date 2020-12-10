import { execute, File, scan } from './utility';

const inputDirectory = '/images/';
const outputDirectory = '/generated/';
const fileSuffix = '.scaled.@(jpeg|jpg|png)';
const scales = [500, 1000, 2000];

function callback(file: File): void {
    for (const scale of scales) {
        const output = file.pathToInputDirectory + outputDirectory + file.name.replace('.scaled.', `.${scale}.`);
        execute(`node_modules/.bin/sharp resize ${scale} --fit inside --withoutEnlargement --quality 80 --input "${file.path}" --output "${output}"`);
    }
}

scan(inputDirectory, fileSuffix, callback);
