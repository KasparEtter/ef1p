/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { bold, subscript, T } from '../../../code/svg/elements/text';

import { printClassification } from './primality-test';

printClassification(
    [
        bold('Liars'),
        T('𝕃', subscript('n')),
    ],
    [
        bold('Witnesses'),
        T('𝕎', subscript('n')),
    ],
);
