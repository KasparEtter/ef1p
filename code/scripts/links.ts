/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

// Open all information boxes.
// $('details').attr('open', '');

// Show all tabs.
// $('.tabbed').addClass('show-all');
// $('.tabbed').children(':not(:first-child)').addClass('shown');

function isValid(href: string): boolean {
    if (href.startsWith('#')) {
        const parts = href.split('&');
        if (parts.length > 1) {
            if (window.handleToolUpdate) {
                return window.handleToolUpdate(parts, true);
            } else {
                console.error('ready.ts: There is no handler for tool updates on this page.');
                return false;
            }
        } else {
            return document.getElementById(href.slice(1)) !== null;
        }
    } else {
        return href.startsWith('https://') || href.startsWith('http://') || href.startsWith('mailto:') || href.startsWith('/');
    }
}

// Check the current page for broken links to anchors on the same page.
for (const element of document.getElementsByTagName('a')) {
    // element.href does not return the raw value.
    const href = element.getAttribute('href');
    if (href !== null && !isValid(href)) {
        console.error(`The following element has a broken link '${href}':`, element);
    }
}

// Check that each ID is used only once on the current page.
const ids = new Set<string>();
for (const element of document.querySelectorAll('[id]')) {
    if (ids.has(element.id)) {
        console.error(`The following elements have the same ID '${element.id}':`, document.querySelectorAll('#' + element.id));
    } else {
        ids.add(element.id);
    }
}

// Count the number of referenced RFCs in the current article.
// const set = new Set();
// $("a[href^='https://datatracker.ietf.org/doc/html/rfc']").each(function() {
//     set.add((this as HTMLAnchorElement).pathname.substring(10));
// });
// console.log(`This article references ${set.size} different RFCs.`);
// console.log(Array.from(set).sort());
