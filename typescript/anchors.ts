// This script checks the current page for broken links to anchors on the same page.
$(() => {
    $("a[href^='#']").each(function() {
        const hash = (this as HTMLAnchorElement).hash;
        if (hash.length > 1 && $(hash).length === 0) {
            console.error('The following element has a broken link:', this);
        }
    });
});
