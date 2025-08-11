/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { insertThousandSeparator } from '../utility/string';

// This script generates a table with all referenced RFCs in the current page.
// Inject this script into the current page with:
// $('<script>').attr('src', '/assets/scripts/internal/rfcs.min.js?nocache=' + Math.random()).appendTo('head')

if (window.location.pathname === '/email/') {
    $('#all-referenced-rfcs').parent().remove();
}

const host = 'https://datatracker.ietf.org';
const path = '/doc/html/rfc';

function link(rfc: string): string {
    return host + path + rfc;
}

const rfcs = new Set<number>();
$(`a[href^="${host}${path}"]`).each(function() {
    rfcs.add(Number((this as HTMLAnchorElement).pathname.substring(13)));
});

async function getRfcData(path: string): Promise<any> {
    return (await fetch(host + path)).json();
}

async function getNonObsoleteRfc(rfc: string): Promise<string> {
    const obsoleted = await getRfcData(`/api/v1/doc/relateddocument/?target__name=rfc${rfc}&relationship=obs`);
    if (obsoleted.objects.length > 0) {
        return getNonObsoleteRfc(obsoleted.objects[0].source.match(/\/rfc(\d+)\//i)[1]);
    } else {
        return rfc;
    }
}

function getSectionId(element: HTMLElement): string {
    let current: Element | null = element;
    while (true) {
        let next: Element | null = current.previousElementSibling;
        if (next === null) {
            next = current.parentElement!;
        }
        if (next.tagName === 'SUMMARY' || /^H[1-6]$/.test(next.tagName)) {
            return next.id;
        }
        current = next;
    }
}

const ignoreMissingNonObsoleteRfcsPerArticle: { [key in string]: number[] } = {
    '/internet/': [349, 821, 882, 883, 918, 1064, 1541, 1883, 2460, 2535],
    '/email/': [],
};

async function generateTable() {
    const rows = ['| ' + [
        'RFC',
        'Date',
        'Title',
        'Words',
        'Pages',
        '<span title="Where the RFC is first referenced in this article.">Ref.</span>',
    ].join(' | '), '|-:|-:|-|-:|-:|:-:'];

    const obsoleteRfcs = new Array<string>();
    const missingNonObsoleteRfcs = new Array<string>();
    let totalWordsAll = 0;
    let totalWordsNonObsolete = 0;
    let totalPagesAll = 0;
    let totalPagesNonObsolete = 0;

    const ignoreMissingNonObsoleteRfcs = ignoreMissingNonObsoleteRfcsPerArticle[window.location.pathname].map(n => n.toString());

    for (const rfc of Array.from(rfcs).sort((a, b) => a - b).map(n => n.toString())) {
        const nonObsoleteRfc = await getNonObsoleteRfc(rfc);
        const obsolete = nonObsoleteRfc !== rfc;
        if (obsolete) {
            obsoleteRfcs.push(rfc);
            if (!ignoreMissingNonObsoleteRfcs.includes(rfc) && !rfcs.has(Number(nonObsoleteRfc))) {
                missingNonObsoleteRfcs.push(link(rfc) + ' => ' + link(nonObsoleteRfc));
            }
            // Skip obsolete RFCs if desired.
            // continue;
        }

        // Skip the table if desired.
        // continue;

        const cells = [`| [${rfc}](${link(rfc)})`];

        const events = await getRfcData(`/api/v1/doc/docevent/?doc__name=rfc${rfc}&type=published_rfc`);
        cells.push(events.objects[0].time.substring(0,7));

        const general = await getRfcData(`/api/v1/doc/document/rfc${rfc}/`);

        // Replace titles which are all capital letters.
        switch (rfc) {
            case '822': cells.push('*Standard for the Format of ARPA Internet Text Messages*'); break;
            case '3501': cells.push('*Internet Message Access Protocol - Version 4rev1*'); break;
            default: cells.push(obsolete ? '*' + general.title + '*' : general.title);
        }

        totalWordsAll += general.words ?? 0;
        if (!obsolete) {
            totalWordsNonObsolete += general.words ?? 0;
        }
        cells.push(general.words ? insertThousandSeparator(general.words) : '–');

        totalPagesAll += general.pages;
        if (!obsolete) {
            totalPagesNonObsolete += general.pages;
        }
        cells.push(general.pages);

        // cells.push($(`a[href^="${link(rfc)}"]`).length.toString());
        cells.push(`[↗](#${getSectionId($(`a[href^="${link(rfc)}"]`)[0])})`);

        // const obsoletes = await getRfcData(`/api/v1/doc/relateddocument/?source__name=rfc${rfc}&relationship=obs`);
        // cells.push(obsoletes.objects.map((object: any) => object.originaltargetaliasname.substring(3)).map((ref: string) => `[RFC ${ref}](${link(ref)})`).join(', '));

        // const updates = await getRfcData(`/api/v1/doc/relateddocument/?source__name=rfc${rfc}&relationship=updates`);
        // cells.push(updates.objects.map((object: any) => object.originaltargetaliasname.substring(3)).map((ref: string) => `[RFC ${ref}](${link(ref)})`).join(', '));

        // const authors = await getRfcData(`/api/v1/doc/documentauthor/?document__name=rfc${rfc}`);
        // cells.push((await Promise.all(authors.objects.map(async (object: any) => await getRfcData(object.person)))).map((object: any) => object.name).join(', '));

        rows.push(cells.join(' | '));
    }

    rows.push('|-');
    rows.push(`| Total: | ${rfcs.size} | RFCs, of which ${obsoleteRfcs.length} are obsolete | ${insertThousandSeparator(totalWordsAll)} | ${insertThousandSeparator(totalPagesAll)} |`);
    rows.push(`| | ${rfcs.size - obsoleteRfcs.length} | non-obsolete RFCs | ${insertThousandSeparator(totalWordsNonObsolete)} | ${insertThousandSeparator(totalPagesNonObsolete)} |`);

    console.log(rows.join('\n') + '\n');

    if (obsoleteRfcs.length > 0) {
        console.log(`The following RFCs have become obsolete:\n` + obsoleteRfcs.filter(rfc => !ignoreMissingNonObsoleteRfcs.includes(rfc)).map(link).join('\n'));
    }

    if (missingNonObsoleteRfcs.length > 0) {
        console.log(`The following RFCs have been superseded by RFCs which aren't referenced in the article:\n` + missingNonObsoleteRfcs.join('\n'));
    }
}

generateTable();
