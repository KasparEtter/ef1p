import katex from 'katex';

$(document).ready(() => {
    // https://github.com/KaTeX/KaTeX/blob/master/contrib/mathtex-script-type/mathtex-script-type.js
    // issued warnings due to the CDATA emitted by kramdown. I'm using a modified version of
    // https://github.com/gettalong/kramdown/issues/292#issuecomment-257770946 instead now.
    $("script[type='math/tex']").replaceWith(function() {
        return katex.renderToString($(this).text(), { displayMode: false });
    });

    $("script[type='math/tex; mode=display']").replaceWith(function() {
        // Replace all characters from % to the end of the line to get rid of the CDATA wrapping.
        return katex.renderToString($(this).text().replace(/%.*/g, ''), { displayMode: true });
    });
});
