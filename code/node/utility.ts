import { exec } from 'child_process';
import fs from 'fs';
import glob from 'glob';

import { sleep } from '../utility/functions';

export interface File {
    /**
     * The path to the input directory ends without a path separator.
     */
    readonly pathToInputDirectory: string;

    /**
     * The name starts without a path separator.
     */
    readonly name: string;

    /**
     * The full path to the file.
     */
    readonly path: string;

    /**
     * The timestamp of last modification.
     */
    readonly date: number;
}

/**
 * Scans for files with the given suffix in the given input directory,
 * which can be nested inside other directories.
 *
 * This function also creates the 'generated' directory
 * on the same level as the given input directory.
 *
 * @param inputDirectory The input directory should start and end with a path separator.
 * @param fileSuffix The file suffix for globbing including the leading period.
 * @param callback The function to call for each found file.
 */
export function scan(
    inputDirectory: string,
    fileSuffix: string,
    callback: (file: File) => any,
): void {
    glob(`**${inputDirectory}*${fileSuffix}`, { nodir: true, nonull: false, strict: true }, (error, paths) => {
        if (error) {
            console.error('The globbing failed with the following error:', error);
            return;
        }

        let files: File[] = paths.filter(path => !path.startsWith('_site/')).map(path => {
            const parts = ('./' + path).split(inputDirectory);
            return {
                pathToInputDirectory: parts[0],
                name: parts[1],
                path,
                date: fs.statSync(path).mtimeMs,
            };
        });

        // Call the callback on the last modified file first.
        files.sort((a, b) => b.date - a.date);
        files = files.slice(0); // Improve performance by generating just the last modified file with `slice(0, 1)`.

        const articles = new Set<string>();
        files.forEach(file => {
            if (!articles.has(file.pathToInputDirectory)) {
                fs.mkdirSync(file.pathToInputDirectory + '/generated', { recursive: true });
                articles.add(file.pathToInputDirectory);
            }
            callback(file);
        });
    });
}

const startSeparator = '\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\n';
const endSeparator = '\n^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n';

function logCommandWithError(command: string, error: string): void {
    console.error(startSeparator + 'Command: ' + command + '\n\n' + error + endSeparator);
}

let counter = 0;

/**
 * This function wraps the 'exec' function from 'child_process'.
 * It logs the command and only calls the callback if there was no error.
 */
export async function execute(command: string, callback?: () => any, limit?: number): Promise<void> {
    if (limit !== undefined) {
        while (counter >= limit) {
            await sleep(2000);
        }
    }
    counter++;
    console.log(command);
    exec(command, (error, _, stderr) => {
        counter--;
        if (error) {
            logCommandWithError(command, error.message);
        } else if (stderr) {
            logCommandWithError(command, stderr);
        } else {
            callback?.();
        }
    });
}
