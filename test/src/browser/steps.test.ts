import fs from 'fs';
import { getSteps, executeSteps } from '../../../src/browser/steps';

describe('Steps Logic', () => {
    jest.setTimeout(30000); // Allow loops to complete

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('getSteps handles parsing errors', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue('invalid json');
        const steps = getSteps('dummy.json');
        expect(steps).toEqual([]);
    });

    it('getSteps uses default path when no arguments provided', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const steps = getSteps();
        expect(steps).toEqual([]);
    });

    const createMockPage = (evaluateResult: 'true' | 'false' | 'throw' | 'execute') => {
        const mockFrame = {
            evaluate: jest.fn().mockImplementation((cb, ...args) => {
                if (evaluateResult === 'throw') throw new Error('cross-origin error');
                if (evaluateResult === 'execute') return cb(...args);
                return evaluateResult === 'true';
            })
        };
        const mockPage: any = {
            frames: jest.fn().mockReturnValue([mockFrame]),
            bringToFront: jest.fn().mockResolvedValue(true),
            keyboard: {
                type: jest.fn().mockResolvedValue(true)
            }
        };
        const mockBrowser = {
            pages: jest.fn().mockResolvedValue([mockPage])
        };
        mockPage.browser = jest.fn().mockReturnValue(mockBrowser);
        return { mockPage, mockFrame };
    };

    it('executeSteps logs warning if element is not clicked', async () => {
        const { mockPage, mockFrame } = createMockPage('false'); // evaluate returns false so it loops 30 times

        await executeSteps(mockPage as any, [
            {
                index: 0,
                element: { type: 'ButtonElement', metadata: { text: 'Not Found' } }
            }
        ]);
        expect(mockFrame.evaluate).toHaveBeenCalledTimes(30);
    });

    it('executeSteps descriptor fallback logic', async () => {
        const { mockPage, mockFrame } = createMockPage('true'); // evaluate returns true

        // fallback to cssClass
        await executeSteps(mockPage as any, [
            { index: 0, element: { type: 'GenericElement', metadata: { class: 'test-class' } } }
        ]);

        // fallback to type
        await executeSteps(mockPage as any, [{ index: 0, element: { type: 'GenericElement', metadata: {} } }]);

        expect(mockFrame.evaluate).toHaveBeenCalledTimes(2);
    });

    it('executeSteps handles InputElement and types text', async () => {
        const { mockPage, mockFrame } = createMockPage('true');

        await executeSteps(mockPage as any, [
            {
                index: 0,
                element: { type: 'InputElement', metadata: { value: 'user@example.com' } }
            }
        ]);

        expect(mockFrame.evaluate).toHaveBeenCalledTimes(1);
        expect(mockPage.bringToFront).toHaveBeenCalledTimes(1);
        expect(mockPage.keyboard.type).toHaveBeenCalledWith('user@example.com', { delay: 50 });
    });

    it('executeSteps inner evaluate logic works with JSDOM mock', async () => {
        const { mockPage, mockFrame } = createMockPage('execute');

        const mockEl = {
            innerText: 'Test Button',
            getAttribute: jest.fn().mockReturnValue(''),
            focus: jest.fn(),
            click: jest.fn()
        };

        global.document = {
            querySelectorAll: jest.fn().mockReturnValue([mockEl])
        } as any;

        await executeSteps(mockPage as any, [
            { index: 0, element: { type: 'ButtonElement', metadata: { text: 'Test Button' } } }
        ]);

        expect(mockEl.focus).toHaveBeenCalled();
        expect(mockEl.click).toHaveBeenCalled();

        // Delete global document after test
        delete (global as any).document;
    });

    it('executeSteps continues searching if evaluate throws error', async () => {
        const { mockPage, mockFrame } = createMockPage('throw');
        await executeSteps(mockPage as any, [
            { index: 0, element: { type: 'ButtonElement', metadata: { text: 'Test Button' } } }
        ]);
        expect(mockFrame.evaluate).toHaveBeenCalledTimes(30);
    });

    it('executeSteps covers JSDOM filtering and out of bounds', async () => {
        const { mockPage, mockFrame } = createMockPage('execute');

        // Element with innerText
        const mockElText = { innerText: 'Target', getAttribute: jest.fn().mockReturnValue('') };
        // Element with value
        const mockElValue = { value: 'Target', getAttribute: jest.fn().mockReturnValue('') };
        // Element with placeholder
        const mockElPlaceholder = { placeholder: 'Target', getAttribute: jest.fn().mockReturnValue('') };
        // Element with aria-label
        const mockElAria = { getAttribute: jest.fn().mockReturnValue('Target') };
        // Element with nothing
        const mockElNothing = { getAttribute: jest.fn().mockReturnValue(null) };

        global.document = {
            querySelectorAll: jest
                .fn()
                .mockReturnValue([mockElText, mockElValue, mockElPlaceholder, mockElAria, mockElNothing])
        } as any;

        // Will match 'Target' via all different attributes, but since we are looking for index 9, it will fail and loop
        await executeSteps(mockPage as any, [
            { index: 9, element: { type: 'ButtonElement', metadata: { text: 'Target' } } }
        ]);

        delete (global as any).document;
        // Since it loops waiting for click, evaluate is called 30 times
        expect(mockFrame.evaluate).toHaveBeenCalledTimes(30);
    });

    it('executeSteps handles InputElement without value (defaults to empty string)', async () => {
        const { mockPage, mockFrame } = createMockPage('true');

        await executeSteps(mockPage as any, [
            {
                index: 0,
                element: { type: 'InputElement', metadata: {} } // missing value!
            }
        ]);

        expect(mockPage.keyboard.type).toHaveBeenCalledWith('', { delay: 50 });
    });

    it('executeSteps evaluate logic skips text check if queryText is falsy (line 50)', async () => {
        const { mockPage, mockFrame } = createMockPage('execute');

        const mockEl = {
            innerText: 'Test Button',
            getAttribute: jest.fn().mockReturnValue(''),
            focus: jest.fn(),
            click: jest.fn()
        };

        global.document = {
            querySelectorAll: jest.fn().mockReturnValue([mockEl])
        } as any;

        // Element with no text metadata, so queryText is undefined/falsy
        await executeSteps(mockPage as any, [
            { index: 0, element: { type: 'ButtonElement', metadata: { class: 'test-class' } } }
        ]);

        expect(mockEl.focus).toHaveBeenCalled();
        expect(mockEl.click).toHaveBeenCalled();

        delete (global as any).document;
    });
});
