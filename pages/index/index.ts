/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { bind } from '../../code/utility/functions';
import { clear, getNumberOfItems } from '../../code/utility/storage';

bind('erase-all-values', 'click', () => {
    if (confirm(`Do you really want to erase ${getNumberOfItems()} stored items?`)) {
        clear();
    }
});
