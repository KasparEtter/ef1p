import { report } from '../../code/utility/analytics';

// Wrapping the code in a function so that we can return from it.
(() => {
    const path = window.location.pathname;

    // If the requested resource is in one of the following subdirectories, redirect to the article.
    const directories = ['/generated/', '/graphics/', '/images/'];
    for (const directory of directories) {
        const index = path.indexOf(directory);
        if (index >= 0) {
            report('notfound', 'directory', path);
            window.location.replace(path.substring(0, index + 1));
            return;
        }
    }

    // If the requested resource ends with one of the following endings, remove the ending.
    const endings = ['.', ',', ':', '!', ')', '.)', '?)', '!)'];
    for (const ending of endings) {
        if (path.endsWith(ending)) {
            report('notfound', 'ending', path);
            window.location.replace(path.slice(0, -ending.length));
            return;
        }
    }

    report('notfound', 'unresolved', path);
})();
