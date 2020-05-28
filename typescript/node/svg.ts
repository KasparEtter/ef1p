import { exec, ExecException } from 'child_process';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

glob('*/graphics/*.svg.ts', { nodir: true, nonull: false, strict: true }, (error, matches) => {
    if (error) {
        console.error('The globbing failed with the following error:', error);
        return;
    }
    const files = matches.map(match => {
        const parts = match.split(path.sep);
        return {
            article: parts[0],
            graphic: parts[2].slice(0, -7),
            path: match,
            date: fs.statSync(match).mtimeMs,
        };
    });
    // Generate the last modified graphic first.
    files.sort((a, b) => b.date - a.date);

    function logError(error: ExecException | null) {
        if (error) {
            console.error('The SVG generation failed with the following error:', error);
        }
    }

    const articles = new Set<string>();
    files.forEach(file => {
        if (!articles.has(file.article)) {
            fs.mkdirSync(file.article + '/generated', { recursive: true });
            articles.add(file.article);
        }
        exec(`node_modules/.bin/ts-node "${file.path}" embedded > "${file.article}/generated/${file.graphic}.embedded.svg"`, logError);
    });
    files.forEach(file => {
        exec(`node_modules/.bin/ts-node "${file.path}" > "${file.article}/generated/${file.graphic}.svg"`, error => {
            logError(error);
            if (error === null) {
                exec(`node_modules/.bin/svgexport "${file.article}/generated/${file.graphic}.svg" "${file.article}/generated/${file.graphic}.png" 2000:`, logError);
            }
        });
    });
});
