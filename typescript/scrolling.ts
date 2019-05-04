// Inspired by http://jsfiddle.net/ianclark001/rkocah23/.

$(() => {
    const originalTitle = document.title;

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
            document.title = originalTitle + ' at ' + href;
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
        }
    };

    // Inspired by https://stackoverflow.com/a/48694139.
    if (window.history && window.history.replaceState) {
        $(window).on('activate.bs.scrollspy', (_, data: { relatedTarget: string }) => {
            document.title = originalTitle + ' at ' + data.relatedTarget;
            window.history.replaceState(null, document.title, data.relatedTarget);
        });
    }

    scrollToCurrentAnchor();
    $(window).on('hashchange', scrollToCurrentAnchor);
    $('body').on('click', 'a', handleLinkClick);

    const hideTocIfShown = () => {
        const toc = $('#toc');
        if (toc.hasClass('shown')) {
            toc.removeClass('shown');
        }
    };

    $('#toc a').on('click', hideTocIfShown);
    $('#toc-toggler').on('click', () => $('#toc').toggleClass('shown'));
});
