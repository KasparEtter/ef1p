/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { bold, outOfFlow, subscript, superscript, T } from '../../../code/svg/elements/text';

import { printClassification } from './primality-test';

printClassification(
    [
        bold('Coprime'),
        T(bold('elements '),'ℤ', outOfFlow(superscript('×')), subscript('n')),
    ],
    [
        bold('Multiples of'),
        bold('prime factors'),
    ],
    'purple',
);
