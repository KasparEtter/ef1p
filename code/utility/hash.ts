/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import createHash from 'create-hash';

export function hashToInteger(input: string): bigint {
    return BigInt('0x' + createHash('sha256').update(input).digest('hex'));
}
