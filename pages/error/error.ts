/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { report } from '../../code/utility/analytics';

// Wrapping the code in a function so that we can return from it.
(() => {
    const path = window.location.pathname;

    // If the requested resource is in one of the following subdirectories, redirect to the article.
    const directories = ['/generated/', '/graphics/', '/images/'];
    for (const directory of directories) {
        const index = path.indexOf(directory);
        if (index >= 0) {
            report(
                'Not found',
                { Type: 'Subdirectory' },
                () => window.location.replace(path.substring(0, index + 1).replace('/pages/', '/')),
            );
            return;
        }
    }

    // If the requested resource ends with one of the following endings, remove the ending.
    const endings = ['.', ',', ':', '!', ')', '.)', '?)', '!)'];
    for (const ending of endings) {
        if (path.endsWith(ending)) {
            report(
                'Not found',
                { Type: 'Ending' },
                () => window.location.replace(path.slice(0, -ending.length)),
            );
            return;
        }
    }

    report(
        'Not found',
        { Type: 'Unresolved' },
    );
})();
