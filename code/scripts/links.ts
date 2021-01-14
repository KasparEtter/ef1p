jQuery(() => {
    // The following code checks the current page for broken links to anchors on the same page.
    $("a[href^='#']").each(function() {
        const hash = (this as HTMLAnchorElement).hash;
        if (hash.length > 1 && !document.getElementById(hash.substring(1))) {
            console.error('The following element has a broken link:', this);
        }
    });

    // The following code counts the number of referenced RFCs in the current article.
    const set = new Set();
    $("a[href^='https://tools.ietf.org/html/rfc']").each(function() {
        set.add((this as HTMLAnchorElement).pathname.substring(6));
    });
    console.log(`This article references ${set.size} different RFCs.`);
    // console.log(Array.from(set).sort());
});
