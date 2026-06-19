import fs from 'fs';
import { getSteps, executeSteps } from '../../../src/browser/steps';

describe('Steps Logic', () => {
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

    it('executeSteps logs warning if element is not clicked', async () => {
        const mockPage = {
            waitForSelector: jest.fn().mockResolvedValue(true),
            evaluate: jest.fn().mockResolvedValue(false) // Not clicked
        };
        await executeSteps(mockPage as any, [
            {
                index: 0,
                element: { type: 'ButtonElement', metadata: { text: 'Not Found' } }
            }
        ]);
        expect(mockPage.evaluate).toHaveBeenCalled();
    });

    it('executeSteps descriptor fallback logic', async () => {
        const mockPage = {
            waitForSelector: jest.fn().mockResolvedValue(true),
            evaluate: jest.fn().mockResolvedValue(true)
        };
        // fallback to cssClass
        await executeSteps(mockPage as any, [
            { index: 0, element: { type: 'GenericElement', metadata: { class: 'test-class' } } }
        ]);
        // fallback to type
        await executeSteps(mockPage as any, [
            { index: 0, element: { type: 'GenericElement', metadata: {} } }
        ]);
        expect(mockPage.waitForSelector).toHaveBeenCalledTimes(2);
    });
});
