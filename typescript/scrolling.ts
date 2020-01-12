$(() => {
    /* Animated scrolling to anchor with updating window title and browser history. */

    const originalTitle = document.title;

    const getTitle = (href: string) => {
        return originalTitle + ' at ' + $(href).text();
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

    const handleLinkClick = (event: JQuery.TriggeredEvent) => {
        if (scrollIfAnchor(event.target.getAttribute('href'), true)) {
            event.preventDefault();
        } else {
            event.target.setAttribute('target', '_blank');
        }
    };

    // Registration inspired by https://stackoverflow.com/a/48694139.
    if (window.history && window.history.replaceState) {
        $(window).on('activate.bs.scrollspy', (_, data: { relatedTarget: string }) => {
            document.title = getTitle(data.relatedTarget);
            window.history.replaceState(null, document.title, data.relatedTarget);
        });
    }

    // Removing the anchor above the first H2 element. Custom solution because no event is triggered in this case:
    // https://github.com/twbs/bootstrap/blob/d7203bac3b935ae414ddb77a15bab44aa5394b88/js/src/scrollspy.js#L235-L239
    const firstH2OffsetY = ($('h2').offset() || { top: 0 }).top - 10; // Offset needed to compensate for scrollspy.
    const handleWindowScroll = () => {
        if (window.scrollY < firstH2OffsetY && location.hash) {
            document.title = originalTitle;
            window.history.replaceState(null, document.title, location.pathname);
        }
    };

    scrollToCurrentAnchor();
    $(window).on('hashchange', scrollToCurrentAnchor);
    $(window).on('scroll', handleWindowScroll);
    $('body').on('click', 'a', handleLinkClick);

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
        titleText: 'Click to directly link to this section.',
    } as any; // titleText was introduced in AnchorJS 4.2.0 and is not yet typed by DefinitelyTyped:
    // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/anchor-js/index.d.ts
    anchors.add();
});
