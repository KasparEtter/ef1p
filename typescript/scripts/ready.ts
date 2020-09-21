import { report } from '../utility/analytics';
import { copyToClipboard } from '../utility/clipboard';

// See https://www.sitepoint.com/css3-animation-javascript-event-handlers/ (oanimationend is Opera):
const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

// If the hash ends with one of the following endings, remove the ending.
const endings = ['.', ',', ':', '?', '!', ')', '.)', '?)', '!)'];
function sanitize(hash: string): string {
    for (const ending of endings) {
        if (hash.endsWith(ending)) {
            report('notfound', 'ending', window.location.pathname + hash);
            return hash.slice(0, -ending.length);
        }
    }
    return hash;
}

jQuery(() => {
    /* Animated scrolling to anchor with updating window title and browser history. */

    const originalTitle = document.title;

    const getTitle = (hashOrElement: string | HTMLElement) => {
        return originalTitle + ' at ' + $(hashOrElement as any).text();
    };

    // Scrolling inspired by http://jsfiddle.net/ianclark001/rkocah23/.
    const scrollIfAnchor = (href: string | null, source: 'load' | 'hash' | 'link' | 'jump') => {
        if (!href || !/^#[^ ]+$/.test(href)) {
            return false;
        }

        const hash = source === 'load' ? sanitize(href) : href;
        const url = window.location.pathname + hash;
        const target = document.getElementById(hash.slice(1));
        if (!target) {
            report('notfound', 'anchor', url);
            return false;
        }
        report('target', source, url);

        if (target.tagName === 'SUMMARY') {
            (target.parentElement as HTMLDetailsElement).open = true;
        }

        const offset = $(target).offset();
        if (!offset) {
            return false;
        }

        if (source !== 'load' && window.history && window.history.pushState) {
            document.title = getTitle(hash);
            window.history.pushState(null, document.title, url);
        }

        $('html, body').animate({ scrollTop: offset.top - 75 });

        return true;
    };
    scrollIfAnchor(window.location.hash, 'load');

    const handleHashChange = (event: JQuery.Event) => {
        if (scrollIfAnchor(window.location.hash, 'hash')) {
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
        const jQueryTarget = $(target) as JQuery<HTMLAnchorElement>;
        if (jQueryTarget.hasClass('anchorjs-link')) {
            event.preventDefault();
            const address = window.location.origin + window.location.pathname + href;
            if (copyToClipboard(address)) {
                jQueryTarget.addClass('scale4').one(animationEnd, () => jQueryTarget.removeClass('scale4'));
                report('anchors', 'click', window.location.pathname + href);
            }
        } else if (scrollIfAnchor(href, 'link')) {
            event.preventDefault();
        } else {
            target.setAttribute('target', '_blank');
            report('links', 'visit', href);
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

    $('#toc a').on('click', hideTocIfShown);
    $('#toc-toggler').on('click', () => $('#toc').toggleClass('shown'));

    /* Jumping to next heading when clicking one. */

    const jumpToNextHeading = (event: JQuery.TriggeredEvent) => {
        if (event.target.tagName === 'SPAN') {
            const target = event.target.closest('h2, h3, h4, h5, h6') as HTMLHeadingElement;
            report('sections', 'skip', window.location.pathname + '#' + target.id);
            const level = parseInt(target.tagName.charAt(1), 10);
            let element = target.nextElementSibling;
            while (element !== null) {
                if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                    if (parseInt(element.tagName.charAt(1), 10) <= level) {
                        scrollIfAnchor('#' + element.id, 'jump');
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
        const details = summary?.closest('details');
        const action = details ? (details.open ? 'close' : 'open') : 'unknown';
        const label = summary ? window.location.pathname + '#' + summary.id : 'unknown';
        report('boxes', action, label);
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
    const downloadAsPNG = $('<a>').addClass(['dropdown-item']).attr('download', '').html('<i class="fas fa-file-image"></i>Download as a pixel image (PNG)');
    const downloadAsSVG = $('<a>').addClass(['dropdown-item']).attr('download', '').html('<i class="fas fa-file-code"></i>Download as a vector graphic (SVG)');
    const downloadMenu = $('<div>').addClass(['dropdown-menu']).append(downloadAsPNG, downloadAsSVG).appendTo('body');

    function showDownloadMenu(this: any, event: JQuery.MouseEventBase) {
        const name = $(this).data('name');
        downloadAsPNG.attr('href', 'generated/' + name + '.png');
        downloadAsSVG.attr('href', 'generated/' + name + '.svg');
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
        $('svg.figure').dblclick(showDownloadMenu);
    } else {
        $('svg.figure').contextmenu(showDownloadMenu);
    }

    $(document).on('click', hideDownloadMenu);

    // Prevent the following elements from becoming focused when clicked.
    $('a, button, summary').on('click', function() { $(this).blur(); });

    // Support abbreviations on touch devices.
    if (isTouchDevice) {
        $('abbr').on('click', function() { alert($(this).text() + ': ' + $(this).attr('title')); });
    }

    // Copy the short link to the clipboard.
    $('#short-link').on('click', event => {
        const target = event.target as HTMLAnchorElement;
        if (copyToClipboard(target.href)) {
            event.preventDefault();
            const jQueryTarget = $(target);
            jQueryTarget.addClass('scale2').one(animationEnd, () => jQueryTarget.removeClass('scale2'));
            report('addresses', 'copy', target.href);
        }
    });

    // Track the number of PDF downloads.
    $('#pdf-download').on('click contextmenu', event => {
        const target = event.target as HTMLAnchorElement;
        console.log(target.href);
        report('articles', 'download', target.href);
    });

    console.log('Hi there, are you curious about how this website works? You find all the code at https://github.com/KasparEtter/ef1p. If you have any questions, just ask.');
});
