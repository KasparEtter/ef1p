import { bind } from './typescript/utility/functions';
import { clear, getNumberOfItems } from './typescript/utility/storage';

bind('erase-all-values', 'click', () => {
    if (confirm(`Do you really want to erase ${getNumberOfItems()} stored items?`)) {
        clear();
    }
});
