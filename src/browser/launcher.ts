import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { CHROME_PATHS, LOG_MESSAGES } from '../constants';
import logger from '../logger';
import { NavigationException } from '../classes/exceptions';
import { getSteps, executeSteps } from './steps';

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
    const stepsPath = process.env.STEPS_FILE_PATH;
    const finalSteps = getSteps(stepsPath);
    if (activeBrowser) {
        logger.info(LOG_MESSAGES.BROWSER_RUNNING);
        return;
    }

    logger.info(LOG_MESSAGES.TARGET_URL(targetUrl));

    const chromePath = findLocalChrome();
    const launchOptions: any = {
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    };

    if (chromePath) {
        logger.info(LOG_MESSAGES.FOUND_CHROME(chromePath));
        launchOptions.executablePath = chromePath;
    } else {
        logger.info(LOG_MESSAGES.FALLBACK_CHROME);
    }

    logger.info(LOG_MESSAGES.LAUNCHING_BROWSER);
    activeBrowser = await puppeteer.launch(launchOptions);

    activeBrowser.on('disconnected', () => {
        logger.info(LOG_MESSAGES.BROWSER_DISCONNECTED);
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

        await executeSteps(page, finalSteps);
    } catch (error) {
        throw new NavigationException(targetUrl, error);
    } finally {
        /* istanbul ignore else */
        if (activeBrowser) {
            logger.info(LOG_MESSAGES.AUTOMATION_COMPLETE);
            await activeBrowser.close();
            activeBrowser = null;
        }
    }
}

export async function cancelAutomation(): Promise<void> {
    if (activeBrowser) {
        logger.info(LOG_MESSAGES.CANCELLING_BROWSER);
        try {
            await activeBrowser.close();
        } catch (e) {
            logger.error('Puppeteer failed to close browser. Exiting node process: ' + e);
            process.exit(1);
        } finally {
            activeBrowser = null;
        }
    } else {
        logger.info(LOG_MESSAGES.NO_ACTIVE_BROWSER);
    }
}

export function getActiveBrowser(): Browser | null {
    return activeBrowser;
}

// Ensure the browser properly closes if the user presses Ctrl+C
process.on('SIGINT', async () => {
    logger.info(LOG_MESSAGES.SIGINT_RECEIVED);
    await cancelAutomation();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info(LOG_MESSAGES.SIGTERM_RECEIVED);
    await cancelAutomation();
    process.exit(0);
});
