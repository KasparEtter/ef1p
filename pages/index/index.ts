import { bind } from '../../code/utility/functions';
import { clear, getNumberOfItems } from '../../code/utility/storage';

bind('erase-all-values', 'click', () => {
    if (confirm(`Do you really want to erase ${getNumberOfItems()} stored items?`)) {
        clear();
    }
});
