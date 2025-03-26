/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { InputError } from '../../react/entry';

export function validateWebAddress(webAddress: string): InputError {
    // These checks are redundant to the regular expression on the last line of this entry but they provide a more specific error message.
    return webAddress === '' && 'The web address may not be empty.' ||
        webAddress.includes(' ') && 'The web address may not contain spaces.' ||
        !webAddress.startsWith('http://') && !webAddress.startsWith('https://') && `The web address has to start with 'http://' or 'https://'.` ||
        !/^[-a-z0-9_.:/?&=!'()*%]+$/i.test(webAddress) && 'Only the Latin alphabet is currently supported.' ||
        !/^(http|https):\/\/([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*[a-z][-a-z0-9]{0,61}[a-z0-9](:\d+)?(\/[a-z0-9-_.:/?&=!'()*%]*)?$/i.test(webAddress) && 'The web address is syntactically invalid.';
}
