import fs from 'fs';
import path from 'path';

import { execute } from './utility';

const file = process.argv[2];
const parts = file.split(path.sep);
const article = parts[1] === 'graphics' ? parts[0] : '.';
const graphic = (parts[1] === 'graphics' ? parts[2] : parts[1]).slice(0, -7);

fs.mkdirSync(article + '/generated', { recursive: true });
execute(`node_modules/.bin/ts-node "${file}" thumbnail > "${article}/generated/${graphic}.thumbnail.svg"`,
    () => execute(`node_modules/.bin/svgexport "${article}/generated/${graphic}.thumbnail.svg" "${article}/generated/${graphic}.thumbnail.png" 1200:`),
);
