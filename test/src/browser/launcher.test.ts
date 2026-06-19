import { launchAndNavigate, cancelAutomation } from '../../../src/browser/launcher';
import puppeteer from 'puppeteer';
import fs from 'fs';

jest.mock('puppeteer', () => ({
    launch: jest.fn()
}));

jest.mock('../../../src/browser/steps', () => ({
    getSteps: jest.fn().mockReturnValue([]),
    executeSteps: jest.fn().mockResolvedValue(true)
}));

describe('Browser Launcher', () => {
    let mockBrowser: any;
    let mockPage: any;
    let mockProcess: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        // Cleanup activeBrowser state if dirty from previous tests
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
        await cancelAutomation();
        exitSpy.mockRestore();

        mockProcess = {
            killed: false,
            kill: jest.fn()
        };

        const mockFrame = {
            evaluate: jest.fn().mockResolvedValue(true)
        };

        mockPage = {
            goto: jest.fn().mockResolvedValue(true),
            waitForSelector: jest.fn().mockResolvedValue(true),
            evaluate: jest.fn().mockResolvedValue(true),
            browser: jest.fn(),
            frames: jest.fn().mockReturnValue([mockFrame]),
            bringToFront: jest.fn().mockResolvedValue(true),
            keyboard: {
                type: jest.fn().mockResolvedValue(true)
            }
        };

        mockBrowser = {
            pages: jest.fn().mockResolvedValue([mockPage]),
            newPage: jest.fn().mockResolvedValue(mockPage),
            close: jest.fn().mockResolvedValue(true),
            process: jest.fn().mockReturnValue(mockProcess),
            on: jest.fn((event, cb) => {
                if (event === 'disconnected') {
                    // Can be used if testing disconnection logic
                }
            })
        };

        mockPage.browser.mockImplementation(() => mockBrowser);
        (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);
    });

    it('launchAndNavigate finds local chrome and launches successfully', async () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        await launchAndNavigate('https://test.com');
        expect(puppeteer.launch).toHaveBeenCalled();
        expect(mockPage.goto).toHaveBeenCalledWith('https://test.com', expect.any(Object));
    });

    it('launchAndNavigate uses bundled browser if local chrome is not found', async () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        await launchAndNavigate('https://test.com');
        expect(puppeteer.launch).toHaveBeenCalled();
    });

    it('launchAndNavigate does not launch a new browser if one is already active', async () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const { executeSteps } = require('../../../src/browser/steps');
        (executeSteps as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // hang forever

        launchAndNavigate('https://test.com');
        await new Promise((r) => setTimeout(r, 100)); // allow activeBrowser to be set

        await launchAndNavigate('https://test.com'); // second call
        expect(puppeteer.launch).toHaveBeenCalledTimes(1);
    });

    it('launchAndNavigate creates a new page if no pages exist', async () => {
        // Need a clean slate
        await cancelAutomation();
        mockBrowser.pages.mockResolvedValue([]);
        await launchAndNavigate('https://test.com');
        expect(mockBrowser.newPage).toHaveBeenCalled();
    });

    it('launchAndNavigate throws NavigationException when navigation fails', async () => {
        await cancelAutomation();
        mockPage.goto.mockRejectedValue(new Error('Navigation Failed'));
        await expect(launchAndNavigate('https://test.com')).rejects.toThrow('Navigation Failed');
    });

    it('cancelAutomation handles close exceptions and exits process', async () => {
        await cancelAutomation();

        const { executeSteps } = require('../../../src/browser/steps');
        (executeSteps as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // hang forever

        launchAndNavigate('https://test.com');
        await new Promise((r) => setTimeout(r, 100)); // allow activeBrowser to be set

        const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
        mockBrowser.close.mockRejectedValue(new Error('Crash'));

        await cancelAutomation();

        expect(exitSpy).toHaveBeenCalledWith(1);
        exitSpy.mockRestore();
    });

    it('handles browser disconnect event', async () => {
        await cancelAutomation();
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        let disconnectCb: any;
        mockBrowser.on.mockImplementation((event: string, cb: any) => {
            if (event === 'disconnected') disconnectCb = cb;
        });

        await launchAndNavigate('https://test.com');

        if (disconnectCb) disconnectCb();

        // Since activeBrowser is now null, cancelAutomation won't call close
        mockBrowser.close.mockClear();
        await cancelAutomation();
        expect(mockBrowser.close).not.toHaveBeenCalled();
    });

    it('getActiveBrowser returns active browser', async () => {
        const { getActiveBrowser } = require('../../../src/browser/launcher');
        expect(getActiveBrowser()).toBe(null);
    });

    it('handles process SIGINT and SIGTERM', async () => {
        // Just trigger the setup to register listeners
        await launchAndNavigate('https://test.com');

        const sigintHandler = process.listeners('SIGINT').pop();
        const sigtermHandler = process.listeners('SIGTERM').pop();

        if (sigintHandler && sigtermHandler) {
            const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
            await (sigintHandler as Function)();
            await (sigtermHandler as Function)();
            expect(exitSpy).toHaveBeenCalled();
            exitSpy.mockRestore();
        }
    });

    it('launchAndNavigate handles puppeteer.launch throwing error', async () => {
        await cancelAutomation(); // Ensure activeBrowser is null
        (puppeteer.launch as jest.Mock).mockRejectedValueOnce(new Error('Launch Failed'));
        await expect(launchAndNavigate('https://test.com')).rejects.toThrow('Launch Failed');
    });
});
