import fs from 'fs';
import puppeteer from 'puppeteer';

import { getCurrentDate } from '../utility/date';

const directory = process.argv[2];

if (!directory) {
    console.error('Please provide the directory as an argument.');
    process.exit();
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // https://github.com/puppeteer/puppeteer/blob/v3.0.4/docs/api.md#pagegotourl-options
    await page.goto(`http://localhost:4000/${directory}/`, { waitUntil: 'load' });

    const [title, published, modified] = await page.evaluate(() => {
        // Expand all details elements.
        $('details').attr('open', '');

        // Remove the 'srcset' attribute on all images.
        // https://stackoverflow.com/a/61807077/12917821
        $('img[srcset]').removeAttr('srcset');

        return [
            document.title,
            $('meta[property="article:published_time"]').attr('content'),
            $('meta[property="article:modified_time"]').attr('content'),
        ];
    });
    const date = modified ?? published ?? getCurrentDate();

    // Wait for higher quality images to be loaded.
    await new Promise(resolve => setTimeout(resolve, 500));

    fs.mkdirSync(`pages/${directory}/generated`, { recursive: true });

    const footerTemplate = `<div style="font-size: 8px; font-family: Lato; width: 100%; margin-bottom: 2mm; text-align: center;">
    <span style="float: left; margin-left: 9.5mm;">
        ${title}
    </span>
    <span>
        <span class="pageNumber"></span>
        /
        <span class="totalPages"></span>
    </span>
    <span style="float: right; margin-right: 9.5mm;">
        <a href="https://ef1p.com/${directory}/" style="color: black; text-decoration: none;">ef1p.com/${directory}</a> on ${date}
    </span>
</div>`;

    const margin = '18mm';

    // https://github.com/puppeteer/puppeteer/blob/v3.0.4/docs/api.md#pagepdfoptions
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
    });
    await browser.close();
})();
