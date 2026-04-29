/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { report } from '../utility/analytics';
import { copyToClipboardWithAnimation } from '../utility/animation';
import { copyToClipboard } from '../utility/clipboard';
import { generateTextFragmentFromCurrentSelection } from '../utility/fragment';
import { getTitle, originalTitle, scrollToAnchor } from '../utility/scrolling';

const production = window.location.hostname !== 'localhost';

if (production || window.location.hash.includes('&')) { // The second part ensures that tool links work also on localhost.
    // The following lines with `scrollToTop` prevent the browser from automatically jumping to the anchor when the page loads,
    // allowing us to scroll programmatically to the anchor with a nice animation (see https://stackoverflow.com/a/39254773/12917821).
    const scrollToTop = () => $(window).scrollTop(0);
    $(window).on('scroll', scrollToTop);
    window.addEventListener('load', () => {
        $(window).off('scroll', scrollToTop);
        // If a browser doesn't support text fragments, we have to remove it from the hash ourselves.
        scrollToAnchor(window.location.hash.split(':~:', 1)[0], 'load');
    });
}

// Since the browser jumps to the anchor before running the handler,
// you shouldn't set the hash with `window.location.hash = '#anchor'`.
// Use `scrollToAnchor('#anchor')` instead.
// I leave the handler as a fallback.
const handleHashChange = (event: HashChangeEvent) => {
    scrollToAnchor(new URL(event.newURL).hash, 'hash');
};
window.addEventListener('hashchange', handleHashChange);

// Whether the page has been published.
// (Non-articles are always considered published, articles only when they have a <meta property="article:published_time">.)
const published = document.querySelector('meta[property="og:type"]')?.getAttribute('content') !== 'article'
    || document.querySelector('meta[property="article:published_time"]') !== null;

const handleLinkClick = (event: JQuery.TriggeredEvent) => {
    const target = event.target.closest('a') as HTMLAnchorElement;
    const href = target.getAttribute('href');
    if (href === null) {
        return;
    }
    if (target.classList.contains('anchorjs-link')) {
        event.preventDefault();
        let address = '';
        if (production) {
            address += window.location.origin;
        }
        if (published) {
            address += window.location.pathname;
        }
        address += href;
        copyToClipboardWithAnimation(address, target, 'scale400');
        report('Copy link', { Anchor: href });
    } else if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && scrollToAnchor(href, 'link')) {
        event.preventDefault();
    } else {
        // Adding <base target="_blank"/> to the <head> would change the behavior of AnchorJS:
        // https://github.com/bryanbraun/anchorjs/blob/e953150d8e50ebc84f490eb11207845803239234/anchor.js#L155-L157
        target.setAttribute('target', '_blank');
    }
};
$('body').on('click', 'a', handleLinkClick);

if (window.history && window.history.replaceState) {
    interface Heading {
        offset: number;
        element: HTMLElement;
    }

    let headings: Heading[];

    const refreshOffsets = () => {
        headings = [];
        $('h2, h3, h4, h5, h6, summary').each((_, element) => {
            const offset = $(element).offset();
            if (offset && offset.top > 0) {
                headings.push({ offset: offset.top - 85, element });
            }
        });
    };

    let bodyHeight: number = 0;
    let currentHeading: HTMLElement | undefined;

    const handleWindowScroll = () => {
        if (bodyHeight !== document.body.scrollHeight) {
            bodyHeight = document.body.scrollHeight;
            refreshOffsets();
        }
        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            if (heading.offset < window.pageYOffset) {
                if (currentHeading !== heading.element) {
                    currentHeading = heading.element;
                    document.title = getTitle(heading.element);
                    window.history.replaceState(null, document.title, '#' + heading.element.id);
                }
                return;
            }
        }
        // Remove the hash when you scroll past the first heading towards the top.
        if (window.location.hash !== '') {
            currentHeading = undefined;
            document.title = originalTitle;
            window.history.replaceState(null, document.title, location.pathname);
        }
    };

    window.addEventListener('load', () => window.addEventListener('scroll', handleWindowScroll, { passive: true }));
}

/* Toggling the table of contents on small screens. */

const hideTocIfShown = () => {
    const toc = $('#toc');
    if (toc.hasClass('shown')) {
        toc.removeClass('shown');
    }
};

jQuery(() => $('#toc a').on('click', hideTocIfShown));
$('#toc-toggler').on('click', () => $('#toc').toggleClass('shown'));

/* Jumping to next heading when clicking one. */

const jumpToNextHeading = (event: JQuery.TriggeredEvent) => {
    if (event.target.tagName === 'SPAN') {
        const target = event.target.closest('h2, h3, h4, h5, h6') as HTMLHeadingElement;
        const level = parseInt(target.tagName.charAt(1), 10);
        let element = target.nextElementSibling;
        while (element !== null) {
            if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                if (parseInt(element.tagName.charAt(1), 10) <= level) {
                    scrollToAnchor('#' + element.id, 'jump');
                    break;
                }
            }
            element = element.nextElementSibling;
        }
    }
};

// Register the click handler only on the text instead of the whole heading by wrapping it.
// Please note that this has to be done before adding the anchors to get the right contents.
$('h2, h3, h4, h5, h6').contents().wrap('<span/>').parent().on('click', jumpToNextHeading);
$('summary').contents().wrap('<span/>'); // Only needed for the margin to the anchor link.

// Track opening and closing of information boxes.
$('summary').on('click', event => {
    const summary = event.target.closest('summary');
    if (summary !== null) {
        const details = summary.closest('details');
        if (details !== null) {
            report(details.open ? 'Close box' : 'Open box', { Anchor: '#' + summary.id });
        }
    }
});

// Add the anchors with AnchorJS. As no IDs need to be added, this instruction can be ignored:
// https://www.bryanbraun.com/anchorjs/#dont-run-it-too-late
anchors.options = {
    visible: 'touch',
    titleText: 'Click to copy the link to this section.',
};
anchors.add('h2, h3, h4, h5, h6, summary');
$('a.anchorjs-link').attr('tabindex', -1);

// Enable click to copy on elements with the corresponding class.
function copy(event: JQuery.TriggeredEvent): void {
    copyToClipboardWithAnimation(event.target.innerText, event.target, 'scale125');
}
$('.enable-click-to-copy').removeClass('enable-click-to-copy').addClass('click-to-copy').prop('title', 'Click to copy.').on('click', copy);

// Clear the highlighting of a potential text fragment on the first mouse down.
const hideTextFragment = () => {
    document.documentElement.style.setProperty('--text-fragment', '0');
    window.removeEventListener('mousedown', hideTextFragment);
};
window.addEventListener('mousedown', hideTextFragment, { passive: true });

// Allow the reader to link directly to the selected text.
const copyLinkToSelectionButton = $('<a>').attr('id', 'copy-link-to-selection-button').prop('title', 'Copy a link to the selected text.').on('click', async event => {
    const fragment = generateTextFragmentFromCurrentSelection();
    if (fragment !== null) {
        let address = '';
        if (production) {
            address += window.location.origin;
        }
        if (published || true) {
            address += window.location.pathname;
        }
        let anchor = '#';

        // Find the preceding id for the selection
        const selection = window.getSelection();
        if (selection !== null && selection.rangeCount > 0) {
            const startContainer = selection.getRangeAt(0).startContainer;
            let element = startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentElement : startContainer as Element;
            while (element !== null) {
                if (element.id !== '') {
                    anchor += element.id;
                    break;
                } else if (element.previousElementSibling !== null) {
                    element = element.previousElementSibling;
                } else {
                    element = element.parentElement;
                }
            }
        }

        address += anchor;
        address += fragment;
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            await copyToClipboard(address);
            // Showing an alert reveals the user selection again on iOS devices (and nothing else worked reliably).
            alert('A link to the selected text has been copied to clipboard.');
        } else {
            copyToClipboardWithAnimation(address, copyLinkToSelectionButton[0], 'scale200');
        }
        report('Copy link', { Anchor: anchor, Fragment: fragment });
    }
    event.preventDefault();
}).on('mousedown', event => event.preventDefault()).appendTo('body');

function updateCopyLinkToSelectionButton() {
    const selection = window.getSelection();
    if (selection !== null && selection.rangeCount > 0 && selection.toString().trim() !== '') {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect(); // coordinates relative to the viewport
        copyLinkToSelectionButton.css({
            left: window.scrollX + rect.left + rect.width / 2 - 15,
            top: window.scrollY + rect.top - 39,
        }).show();
    } else {
        copyLinkToSelectionButton.hide();
    }
}

$(document).on('selectionchange', updateCopyLinkToSelectionButton);
$(window).on('resize', updateCopyLinkToSelectionButton);

// Allow the reader to download embedded SVG figures.
const downloadAsPNG = $('<a>').addClass('dropdown-item').attr('download', '').html('<i class="icon-left fas fa-file-image"></i>Download as a pixel image (PNG)');
const downloadAsSVG = $('<a>').addClass('dropdown-item').attr('download', '').html('<i class="icon-left fas fa-file-code"></i>Download as a vector graphic (SVG)');
const downloadMenu = $('<div>').addClass('dropdown-menu').append(downloadAsPNG, downloadAsSVG).appendTo('body');

function showDownloadMenu(this: any, event: JQuery.MouseEventBase) {
    const page = window.location.pathname.replace(/\//g, '') || 'index';
    const name = $(this).data('name');
    downloadAsPNG.attr('href', `/pages/${page}/generated/${name}.png`);
    downloadAsSVG.attr('href', `/pages/${page}/generated/${name}.svg`);
    downloadMenu.css({ left: event.pageX, top: event.pageY }).show();
    event.preventDefault();
}

const hideDownloadMenu = () => {
    downloadMenu.hide();
}

// https://github.com/bryanbraun/anchorjs/blob/e084f4c8c70e620cbd65290c279c6c55ed6233eb/anchor.js#L51-L53
// @ts-ignore
const isTouchDevice = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

if (isTouchDevice) {
    $('figure svg.figure').on('dblclick', showDownloadMenu);
} else {
    $('figure svg.figure').on('contextmenu', showDownloadMenu);
}

downloadMenu.on('mousedown', event => event.stopPropagation());
$(document).on('mousedown', hideDownloadMenu);

// Prevent the following elements from becoming focused when clicked.
$('a, button, summary').on('click', function() { $(this).trigger('blur'); });

// Support abbreviations on touch devices.
if (isTouchDevice) {
    $('abbr').on('click', function() { alert($(this).text() + ': ' + $(this).attr('title')); });
}

// Expand all information boxes.
$('#details-expander').on('click', () => {
    const hash = window.location.hash;
    $('details').attr('open', '');
    $('#details-expander').addClass('d-none');
    $('#details-collapser').removeClass('d-none');
    scrollToAnchor(hash, 'expand');
    report('Open box', { Anchor: 'all' });
});

// Collapse all information boxes.
$('#details-collapser').on('click', () => {
    const hash = window.location.hash;
    $('details').removeAttr('open');
    $('#details-collapser').addClass('d-none');
    $('#details-expander').removeClass('d-none');
    scrollToAnchor(hash, 'expand');
    report('Close box', { Anchor: 'all' });
});

// Track the number of PDF downloads.
$('#pdf-download').on('click contextmenu', event => {
    const href = (event.target as HTMLAnchorElement).href;
    report('Download article', { File: href.substring(href.lastIndexOf('/') + 1).replace(/%20/g, ' ') });
});

// Remove the cookies set by earlier versions of this website.
if (document.cookie !== '') {
    function clearCookie(name: string, domain = true): void {
        document.cookie = name + '=; path=/; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (domain ? '; domain=explained-from-first-principles.com' : '');
    }
    clearCookie('_ga');
    clearCookie('_gid');
    clearCookie('_gat_gtag_UA_135908849_1');
    clearCookie('cookieconsent_status', false);
}

// Trigger the processing of ScrollSpy after load.
// https://github.com/twbs/bootstrap/blob/v4-dev/js/src/scrollspy.js
// https://github.com/afeld/bootstrap-toc/blob/gh-pages/bootstrap-toc.js
window.addEventListener('load', () => {
    // I have no idea why it doesn't work without a timeout.
    setTimeout(() => {
        const body = $('body') as any;
        body.scrollspy('refresh');
        body.trigger('scroll');
    }, 200);
});

console.log('Hi there, are you curious about how this website works? You find all the code at https://github.com/KasparEtter/ef1p. If you have any questions, just ask.');
