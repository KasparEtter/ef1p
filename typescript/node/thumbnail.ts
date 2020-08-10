import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const file = process.argv[2];
const parts = file.split(path.sep);
const article = parts[1] === 'graphics' ? parts[0] : '.';
const graphic = (parts[1] === 'graphics' ? parts[2] : parts[1]).slice(0, -7);

fs.mkdirSync(article + '/generated', { recursive: true });
exec(`node_modules/.bin/ts-node "${file}" thumbnail > "${article}/generated/${graphic}.thumbnail.svg"`, error => {
    if (error) {
        console.error('The thumbnail SVG generation failed with the following error:', error);
    } else {
        exec(`node_modules/.bin/svgexport "${article}/generated/${graphic}.thumbnail.svg" "${article}/generated/${graphic}.thumbnail.png" 1200:`, error => {
            if (error) {
                console.error('The thumbnail PNG generation failed with the following error:', error);
            }
        });
    }
});
