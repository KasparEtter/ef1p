/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

class TabbedArea {
    readonly container: JQuery<HTMLElement>;
    readonly children: JQuery<HTMLElement>;
    readonly titles: string[];
    readonly tabs: JQuery<HTMLElement>[];

    constructor(
        element: HTMLElement,
    ) {
        this.container = $(element);
        this.container.children().wrap('<div/>');
        this.children = this.container.children();
        this.titles = (this.container.data('titles') as string).split(' | ');
        this.children.each((index, element) => {
            $(element).prepend($('<div>').addClass('title').text(this.titles[index]));
        });
        this.tabs = this.titles.map(title => $('<li>').text(title)
            .on('click', () => this.activate(title))
            .on('dblclick', () => activateAll(title)));
        this.container.prepend($('<ul>').addClass('tabs').append(this.tabs));
        this.container.addClass('javascript-enabled');
        this.activate(this.container.data('default') as string || this.titles[0]);
    }

    activate(title: string): void {
        let index = this.titles.indexOf(title);
        if (title === 'All' || title === 'Both') {
            index = this.titles.length - 1;
        }
        if (index !== -1) {
            this.container.removeClass('show-all');
            this.children.removeClass('shown');
            this.tabs.forEach(tab => tab.removeClass('active'));
            if (index === this.titles.length - 1) {
                if (this.titles.length > 1) {
                    this.container.addClass('show-all');
                }
                this.children.addClass('shown');
            } else {
                this.children.eq(index).addClass('shown');
            }
            this.tabs[index].addClass('active');
        }
    }
}

const areas = new Array<TabbedArea>();

export function activateAll(title: string, scroll = true): void {
    for (const area of areas) {
        area.activate(title);
    }
    if (scroll) {
        $('html, body').animate({ scrollTop: $(window.location.hash).offset()!.top - 75 });
    }
}

export function bindTabbed() {
    $('.tabbed').each(function() {
        areas.push(new TabbedArea(this));
    });
}
