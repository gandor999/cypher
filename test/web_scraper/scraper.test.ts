import { scrape } from '../../web_scraper/scraper';
import puppeteer from 'puppeteer';

jest.mock('puppeteer', () => ({
    launch: jest.fn()
}));

describe('Web Scraper', () => {
    it('should extract correct elements matching a keyword', async () => {
        const mockPage = {
            goto: jest.fn().mockResolvedValue(true),
            evaluate: jest.fn().mockResolvedValue([
                { tag: 'A', text: 'Trade on Web', className: 'btn', id: null, href: 'https://test.com' },
                { tag: 'A', text: 'Trade on Web', className: 'btn', id: null, href: 'https://test.com' },
                { tag: 'DIV', text: '', className: 'empty', id: null, href: null },
                { tag: 'SPAN', text: 'A'.repeat(201), className: 'huge', id: null, href: null }
            ])
        };
        const mockBrowser = {
            newPage: jest.fn().mockResolvedValue(mockPage),
            close: jest.fn().mockResolvedValue(true)
        };

        (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

        const results = await scrape('https://example.com', 'web');

        expect(puppeteer.launch).toHaveBeenCalled();
        expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', { waitUntil: 'networkidle2' });
        expect(mockPage.evaluate).toHaveBeenCalled();
        expect(mockBrowser.close).toHaveBeenCalled();

        // Should deduplicate and return 1 item
        expect(results).toHaveLength(1);
        expect(results[0].text).toBe('Trade on Web');
    });
});
