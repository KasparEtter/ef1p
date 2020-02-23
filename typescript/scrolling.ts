import { copyToClipboard } from './clipboard';

// See https://www.sitepoint.com/css3-animation-javascript-event-handlers/ (oanimationend is Opera):
const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

$(() => {
    /* Animated scrolling to anchor with updating window title and browser history. */

    const originalTitle = document.title;

    const getTitle = (href: string | HTMLElement) => {
        return originalTitle + ' at ' + $(href as any).text();
    };

    // Scrolling inspired by http://jsfiddle.net/ianclark001/rkocah23/.
    const scrollIfAnchor = (href: string | null, pushToHistory: boolean = false) => {
        if (!href || !/^#[^ ]+$/.test(href)) {
            return false;
        }

        const match = document.getElementById(href.slice(1));
        if (!match) {
            return false;
        }

        const offset = $(match).offset();
        if (!offset) {
            return false;
        }

        if (pushToHistory && window.history && window.history.pushState) {
            document.title = getTitle(href);
            window.history.pushState(null, document.title, window.location.pathname + href);
        }

        $('html, body').animate({ scrollTop: offset.top });

        return true;
    };

    const scrollToCurrentAnchor = (event?: JQuery.Event) => {
        if (scrollIfAnchor(window.location.hash) && event) {
            event.preventDefault();
        }
    };
    scrollToCurrentAnchor();
    $(window).on('hashchange', scrollToCurrentAnchor);

    const handleLinkClick = (event: JQuery.TriggeredEvent) => {
        const href: string | undefined = event.target.getAttribute('href');
        if (href === undefined) {
            return;
        }
        const target = $(event.target);
        if (target.hasClass('anchorjs-link')) {
            event.preventDefault();
            const address = location.origin + location.pathname + href;
            if (copyToClipboard(address)) {
                target.addClass('scale').one(animationEnd, () => target.removeClass('scale'));
            }
        } else if (scrollIfAnchor(href, true)) {
            event.preventDefault();
        } else {
            event.target.setAttribute('target', '_blank');
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
            $('h2, h3, h4, h5, h6').each((_, element) => {
                const offset = $(element).offset();
                if (offset) {
                    headings.push({ offset: offset.top - 11, element }); // Offset needed to match scrollspy.
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
        const targetSpan: HTMLElement = event.target;
        const targetHeading = targetSpan.parentElement!;
        const headingLevel = parseInt(targetHeading.tagName.charAt(1), 10);
        let nextElement = targetHeading.nextElementSibling;
        while (nextElement !== null) {
            if (nextElement.tagName.charAt(0) === 'H') {
                if (parseInt(nextElement.tagName.charAt(1), 10) <= headingLevel) {
                    scrollIfAnchor('#' + nextElement.id, true);
                    break;
                }
            }
            nextElement = nextElement.nextElementSibling;
        }
    };

    // Register the click handler only on the text instead of the whole heading by wrapping it.
    // Please note that this has to be done before adding the anchors to get the right contents.
    $('h2, h3, h4, h5, h6').contents().wrap('<span/>').parent().on('click', jumpToNextHeading);

    // Add the anchors with AnchorJS. As no IDs need to be added, this instruction can be ignored:
    // https://www.bryanbraun.com/anchorjs/#dont-run-it-too-late
    anchors.options = {
        visible: 'touch',
        titleText: 'Click to copy the link to this section.',
    };
    anchors.add();
    $('a.anchorjs-link').attr('tabindex', -1);

    // Prevent the anchor and summary elements from becoming focused when clicked.
    $('a, summary').on('click', function() { $(this).blur(); });
});
