/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { report } from '../utility/analytics';
import { copyToClipboardWithAnimation } from '../utility/animation';

// If the hash ends with one of the following endings, remove the ending.
const endings = ['.', ',', ':', '?', '!', ')', '.)', '?)', '!)'];
function sanitize(hash: string): string {
    for (const ending of endings) {
        if (hash.endsWith(ending)) {
            return hash.slice(0, -ending.length);
        }
    }
    return hash;
}

/* Animated scrolling to anchor with updating window title and browser history. */

const originalTitle = document.title;

const getTitle = (hashOrElement: string | HTMLElement) => {
    return originalTitle + ' at ' + $(hashOrElement as any).text();
};

const scrollToAnchor = (hash: string | null, trigger: 'load' | 'hash' | 'link' | 'jump') => {
    if (!hash || !/^#[^ ]+$/.test(hash)) {
        return false;
    }

    const parts = hash.split('&');
    if (parts.length > 1) {
        if (window.handleToolUpdate) {
            window.handleToolUpdate(parts);
        } else {
            console.error('There is no handler for tool updates on this page.');
        }
        hash = parts[0];
    }

    const anchor = trigger === 'load' ? sanitize(hash) : hash;
    const url = window.location.pathname + anchor;
    const target = document.getElementById(anchor.slice(1));
    if (!target) {
        if (trigger === 'load') {
            report('Not found', { Type: 'Anchor', Anchor: anchor });
        }
        return false;
    }
    if (trigger === 'load') {
        report('Load target', { Anchor: anchor });
    }

    if (target.tagName === 'SUMMARY') {
        (target.parentElement as HTMLDetailsElement).open = true;
    } else {
        const details = target.closest('details');
        if (details !== null && !details.open) {
            details.open = true;
        }
    }

    const offset = $(target).offset();
    if (!offset) {
        return false;
    }

    if (trigger !== 'load' && window.history && window.history.pushState) {
        document.title = getTitle(anchor);
        window.history.pushState(null, document.title, url);
    }

    $('html, body').animate({ scrollTop: offset.top - 75 });

    return true;
};
scrollToAnchor(window.location.hash, 'load');

const handleHashChange = (event: JQuery.Event) => {
    if (scrollToAnchor(window.location.hash, 'hash')) {
        event.preventDefault();
    }
};
$(window).on('hashchange', handleHashChange);

const handleLinkClick = (event: JQuery.TriggeredEvent) => {
    const target = event.target.closest('a') as HTMLAnchorElement;
    const href = target.getAttribute('href');
    if (href === null) {
        return;
    }
    if (target.classList.contains('anchorjs-link')) {
        event.preventDefault();
        const address = window.location.origin + window.location.pathname + href;
        if (copyToClipboardWithAnimation(address, target, 'scale400')) {
            report('Copy link', { Anchor: href });
        }
    } else if (scrollToAnchor(href, 'link')) {
        event.preventDefault();
    } else {
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
            if (offset) {
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
            if (window.pageYOffset > heading.offset) {
                if (currentHeading !== heading.element) {
                    currentHeading = heading.element;
                    document.title = getTitle(heading.element);
                    window.history.replaceState(null, document.title, '#' + heading.element.id);
                }
                return;
            }
        }
        if (location.hash) {
            currentHeading = undefined;
            document.title = originalTitle;
            window.history.replaceState(null, document.title, location.pathname);
        }
    };

    $(window).on('scroll', handleWindowScroll);
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
        if (details !== null && !details.open) {
            report('Open box', { Anchor: '#' + summary.id });
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

$(document).on('click', hideDownloadMenu);

// Prevent the following elements from becoming focused when clicked.
$('a, button, summary').on('click', function() { $(this).trigger('blur'); });

// Support abbreviations on touch devices.
if (isTouchDevice) {
    $('abbr').on('click', function() { alert($(this).text() + ': ' + $(this).attr('title')); });
}

// Expand all information boxes.
$('#details-expander').on('click', _ => {
    $('details').attr('open', '');
    $('#details-expander').addClass('d-none');
    $('#details-collapser').removeClass('d-none');
    report('Open box', { Anchor: 'all' });
});

// Collapse all information boxes.
$('#details-collapser').on('click', _ => {
    $('details').removeAttr('open');
    $('#details-collapser').addClass('d-none');
    $('#details-expander').removeClass('d-none');
});

// Track the number of PDF downloads.
$('#pdf-download').on('click contextmenu', event => {
    const target = event.target as HTMLAnchorElement;
    report('Download article', { Version: target.href });
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

console.log('Hi there, are you curious about how this website works? You find all the code at https://github.com/KasparEtter/ef1p. If you have any questions, just ask.');
