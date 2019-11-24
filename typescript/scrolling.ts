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

    scrollToCurrentAnchor();
    $(window).on('hashchange', scrollToCurrentAnchor);
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

    /* Jumping to next header when clicking one. */

    const jumpToNextHeader = (event: JQuery.TriggeredEvent) => {
        const target: HTMLElement = event.target;
        // Exclude the anchors added by AnchorJS.
        if (target.tagName.charAt(0) === 'H') {
            const headerLevel = parseInt(target.tagName.charAt(1), 10);
            let nextElement = target.nextElementSibling;
            while (nextElement !== null) {
                if (nextElement.tagName.charAt(0) === 'H') {
                    if (parseInt(nextElement.tagName.charAt(1), 10) <= headerLevel) {
                        scrollIfAnchor('#' + nextElement.id, true);
                        break;
                    }
                }
                nextElement = nextElement.nextElementSibling;
            }
        }
    };

    $('h2, h3, h4, h5, h6').on('click', jumpToNextHeader);
});
