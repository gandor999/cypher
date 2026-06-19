/**
 * @jest-environment jsdom
 */
import { setupInspectButton } from '../../../public/handlers/inspect.js';
import {
    INSPECT_FAILED_TEXT,
    INSPECT_SUCCESS_TEXT,
    INSPECT_DEFAULT_TEXT,
    THEME_COLORS
} from '../../../public/constants/index.js';

describe('Inspect Button Handler', () => {
    let ui;

    beforeEach(() => {
        // Setup mock UI elements
        ui = {
            inspectBtn: document.createElement('button')
        };

        // Mock global fetch
        global.fetch = jest.fn();

        // Mock timers
        jest.useFakeTimers();

        // Silence console.error for expected failures
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.resetAllMocks();
    });

    it('should do nothing if inspectBtn is not in ui object', () => {
        const emptyUi = {};
        setupInspectButton(emptyUi); // Should return early and not throw
        expect(emptyUi.inspectBtn).toBeUndefined();
    });

    it('should show success message and turn green on successful extract', async () => {
        global.fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce({ success: true })
        });

        setupInspectButton(ui);

        // Trigger click
        ui.inspectBtn.click();

        // Wait for async promises to resolve
        await Promise.resolve(); // fetch
        await Promise.resolve(); // json

        expect(ui.inspectBtn.textContent).toBe(INSPECT_SUCCESS_TEXT);
        expect(ui.inspectBtn.style.color).toBe('rgb(74, 222, 128)');
    });

    it('should show failed message and turn red on failed extract', async () => {
        global.fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce({ success: false })
        });

        setupInspectButton(ui);

        ui.inspectBtn.click();

        await Promise.resolve();
        await Promise.resolve();

        expect(ui.inspectBtn.textContent).toBe(INSPECT_FAILED_TEXT);
        expect(ui.inspectBtn.style.color).toBe('rgb(248, 113, 113)');
    });

    it('should show failed message and turn red on network error', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network Error'));

        setupInspectButton(ui);

        ui.inspectBtn.click();

        await Promise.resolve(); // let the fetch rejection settle

        expect(ui.inspectBtn.textContent).toBe(INSPECT_FAILED_TEXT);
        expect(ui.inspectBtn.style.color).toBe('rgb(248, 113, 113)');
    });

    it('should reset to default state after 3 seconds', async () => {
        global.fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce({ success: true })
        });

        setupInspectButton(ui);
        ui.inspectBtn.click();

        await Promise.resolve();
        await Promise.resolve();

        expect(ui.inspectBtn.textContent).toBe(INSPECT_SUCCESS_TEXT);

        // Fast-forward 3000ms
        jest.advanceTimersByTime(3000);

        expect(ui.inspectBtn.textContent).toBe(INSPECT_DEFAULT_TEXT);
        expect(ui.inspectBtn.style.color).toBe('rgb(74, 222, 128)');
        expect(ui.inspectBtn.disabled).toBe(false);
    });
});
