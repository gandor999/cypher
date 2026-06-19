import puppeteer from 'puppeteer';

export async function scrape(url: string, keyword: string) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    /* istanbul ignore next */
    const elements = await page.evaluate((keyword) => {
        const results: any[] = [];
        document.querySelectorAll('a, button, span, div, input').forEach((el) => {
            const elAny = el as any;
            const text = (elAny.innerText || elAny.placeholder || elAny.value || '').replace(/\n/g, ' ').trim();
            if (text && (!keyword || text.toLowerCase().includes(keyword.toLowerCase()))) {
                results.push({
                    tag: el.tagName,
                    text: text,
                    className: el.className,
                    id: el.id || null,
                    href: elAny.href || null
                });
            }
        });
        return results;
    }, keyword);

    // Deduplicate
    const unique: any[] = [];
    const seen = new Set();
    for (const el of elements) {
        if (!el.text || el.text.length > 200) continue; // skip massive blocks of text
        const key = el.tag + '|' + el.text;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(el);
        }
    }

    await browser.close();
    return unique;
}

/* istanbul ignore next */
if (require.main === module) {
    const url = process.argv[2] || 'https://www.heygotrade.com';
    const keyword = process.argv[3] || '';

    console.log(`Scraping ${url} for keyword: "${keyword}"...`);
    scrape(url, keyword)
        .then((unique) => {
            console.log(JSON.stringify(unique, null, 2));
        })
        .catch((err) => console.error(err));
}
