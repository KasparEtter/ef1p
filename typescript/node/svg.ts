import { exec } from 'child_process';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

glob('**/graphics/*.svg.ts', { nodir: true, nonull: false, strict: true }, (error, matches) => {
    if (error) {
        console.error('The globbing failed with the following error:', error);
        return;
    }
    let files = matches.map(match => {
        const parts = match.split(path.sep);
        return {
            article: parts[1] === 'graphics' ? parts[0] : '.',
            graphic: (parts[1] === 'graphics' ? parts[2] : parts[1]).slice(0, -7),
            path: match,
            date: fs.statSync(match).mtimeMs,
        };
    });
    // Generate the last modified graphic first.
    files.sort((a, b) => b.date - a.date);
    files = files.slice(0); // Improve performance by generating just the last modified SVG with `slice(0, 1)`.

    const articles = new Set<string>();
    files.forEach(file => {
        if (!articles.has(file.article)) {
            fs.mkdirSync(file.article + '/generated', { recursive: true });
            articles.add(file.article);
        }
        exec(`node_modules/.bin/ts-node "${file.path}" embedded > "${file.article}/generated/${file.graphic}.embedded.svg"`, error => {
            if (error) {
                console.error('The embedded SVG generation failed with the following error:', error);
            } else {
                exec(`node_modules/.bin/ts-node "${file.path}" > "${file.article}/generated/${file.graphic}.svg"`, error => {
                    if (error) {
                        console.error('The SVG generation failed with the following error:', error);
                    } else {
                        exec(`node_modules/.bin/svgexport "${file.article}/generated/${file.graphic}.svg" "${file.article}/generated/${file.graphic}.png" 2000:`, error => {
                            if (error) {
                                console.error('The PNG generation failed with the following error:', error);
                            }
                        });
                    }
                });
            }
        });
    });
});
