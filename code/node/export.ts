/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import fs from 'fs';
import puppeteer from 'puppeteer';

import { Time } from '../utility/time';

// Declared in the HTML head.
declare const themes: {
    dark: string;
    light: string;
};

const directory = process.argv[2];

if (!directory) {
    console.error('Please provide the directory as an argument.');
    process.exit();
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // https://pptr.dev/api/puppeteer.page.goto/
    await page.goto(`http://localhost:4000/${directory}/`, { waitUntil: 'load' });

    const [title, published, modified] = await page.evaluate(() => {
        // Expand all details elements.
        $('details').attr('open', '');

        // Remove the 'srcset' and 'sizes' attributes on all images.
        // https://stackoverflow.com/a/61807077/12917821
        $('img[srcset]').removeAttr('srcset');
        $('img[sizes]').removeAttr('sizes');

        // Set the theme to get the right colors.
        $('#theme').attr('href', themes.light);

        // Trigger all the tools with a submit button.
        window.submitAllTools();

        return [
            document.title,
            $('meta[property="article:published_time"]').attr('content'),
            $('meta[property="article:modified_time"]').attr('content'),
        ];
    });
    const date = modified ?? published ?? Time.current().toLocalTime().toGregorianDate();

    // Wait for higher quality images to be loaded and algorithms to be animated.
    await new Promise(resolve => setTimeout(resolve, 60000));

    fs.mkdirSync(`pages/${directory}/generated`, { recursive: true });

    const footerTemplate = `<div style="font-size: 11px; font-family: Lato; width: 100%; margin-bottom: 3mm; text-align: center;">
        <span style="float: left; margin-left: 12.8mm;">
            ${title}
        </span>
        <span>
            <span class="pageNumber"></span>
            /
            <span class="totalPages"></span>
        </span>
        <span style="float: right; margin-right: 12.9mm;">
            <a href="https://ef1p.com/${directory}/" style="color: black; text-decoration: none;">ef1p.com/${directory}</a> on ${date}
        </span>
    </div>`;

    const margin = '18mm';

    // https://pptr.dev/api/puppeteer.pdfoptions
    await page.pdf({
        path: `pages/${directory}/generated/${date} ${title}.pdf`,
        width: '210mm',
        height: '297mm',
        margin: {
            top: '17mm',
            right: margin,
            bottom: '20mm',
            left: margin,
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate,
        outline: true,
        timeout: 1200000,
    });
    await browser.close();
})();
