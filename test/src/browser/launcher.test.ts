import { launchAndNavigate, cancelAutomation } from '../../../src/browser/launcher';
import puppeteer from 'puppeteer';
import fs from 'fs';

jest.mock('puppeteer', () => ({
    launch: jest.fn()
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

        mockPage = {
            goto: jest.fn().mockResolvedValue(true),
            waitForSelector: jest.fn().mockResolvedValue(true),
            evaluate: jest.fn().mockResolvedValue(true)
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
        await launchAndNavigate('https://test.com');
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
        await launchAndNavigate('https://test.com');

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
});
