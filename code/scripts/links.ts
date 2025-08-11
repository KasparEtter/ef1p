/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

// This script is included only if jekyll.environment != 'production'.

// Mark the state of all information boxes and then open them all.
$('details').each(function() {
    $(this).find('summary').addClass($(this).prop('open') ? 'open' : 'closed');
});
$('details').attr('open', '');

// Show all tabs of tabbed areas.
$('.tabbed').addClass('show-all');
$('.tabbed').children(':not(:first-child)').addClass('shown');

function isValidTarget(href: string): boolean {
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
    if (href !== null && !isValidTarget(href)) {
        console.error(`The following element has a broken link to '${href}':`, element);
    }
}

const desiredId = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// Check that each ID is valid and is used only once on the current page.
const ids = new Set<string>();
for (const element of document.querySelectorAll('[id]')) {
    if (ids.has(element.id)) {
        console.error(`The following elements have the same ID '${element.id}':`, document.querySelectorAll('#' + element.id));
    } else {
        if (!desiredId.test(element.id) && element.tagName !== 'DATALIST') {
            console.error(`The following element has an undesired ID of '${element.id}':`, element);
        }
        ids.add(element.id);
    }
}
