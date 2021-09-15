/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

const options = ['all', 'generic', 'additive', 'multiplicative'];

export function bindNotation() {
    $('.notation').each(function() {
        const container = $(this);
        const notations = container.children();
        const tabs = options.map((option, index) => $('<li>').text(option).on('click', () => activate(index)));
        container.prepend($('<ul>').addClass('tabs').append(tabs));

        let activeTab: JQuery<HTMLElement> | undefined;
        const activate = (index: number) => {
            notations.each(function() { $(this).removeClass('shown'); });
            activeTab?.removeClass('active');
            if (index === 0) {
                notations.each(function() { $(this).addClass('shown'); });
            } else {
                notations.eq(index - 1).addClass('shown');
            }
            activeTab = tabs[index];
            activeTab.addClass('active');
        }

        const defaultOption = container.data('default') as string || 'additive';
        activate(options.findIndex(option => option === defaultOption));
    });
}
