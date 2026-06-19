import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import { CHROME_PATHS } from '../constants';
import logger from '../logger';
import { NavigationException } from '../classes/exceptions';

function findLocalChrome(): string | null {
    for (const chromePath of CHROME_PATHS) {
        if (chromePath && fs.existsSync(chromePath)) {
            return chromePath;
        }
    }
    return null;
}

let activeBrowser: Browser | null = null;

export async function launchAndNavigate(targetUrl: string): Promise<void> {
    if (activeBrowser) {
        logger.info('Browser is already running.');
        return;
    }

    logger.info(`Target URL: ${targetUrl}`);

    const chromePath = findLocalChrome();
    const launchOptions: any = {
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    };

    if (chromePath) {
        logger.info(`Found local Google Chrome at: ${chromePath}`);
        launchOptions.executablePath = chromePath;
    } else {
        logger.info("Local Google Chrome not found in standard paths. Falling back to Puppeteer's bundled browser.");
    }

    logger.info('Launching browser...');
    activeBrowser = await puppeteer.launch(launchOptions);

    activeBrowser.on('disconnected', () => {
        logger.info('Browser disconnected or closed.');
        activeBrowser = null;
    });

    try {
        const browser = activeBrowser;
        const pages = await browser.pages();
        let page = pages[0];
        if (!page) {
            page = await browser.newPage();
        }

        await page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
    } catch (error) {
        throw new NavigationException(targetUrl, error);
    }
}

export async function cancelAutomation(): Promise<void> {
    if (activeBrowser) {
        logger.info('Cancelling automation: closing browser...');
        try {
            await activeBrowser.close();
        } catch (e) {
            logger.error('Puppeteer failed to close browser. Exiting node process: ' + e);
            process.exit(1);
        } finally {
            activeBrowser = null;
        }
    } else {
        logger.info('No active browser to cancel.');
    }
}
