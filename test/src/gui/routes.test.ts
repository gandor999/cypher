import request from 'supertest';
import { app } from '../../../src/server';
import * as browser from '../../../src/browser';

import { TARGET_URL } from '../../../src/constants';

jest.mock('../../../src/browser', () => ({
    launchAndNavigate: jest.fn().mockResolvedValue(true),
    cancelAutomation: jest.fn().mockResolvedValue(true)
}));

describe('GUI API Routes', () => {
    it('POST /api/start-automation should call launchAndNavigate', async () => {
        const res = await request(app).post('/api/start-automation');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(browser.launchAndNavigate).toHaveBeenCalledWith(TARGET_URL);
    });

    it('POST /api/start-automation should handle errors', async () => {
        (browser.launchAndNavigate as jest.Mock).mockImplementation(() => { throw new Error('Sync fail'); });
        const res = await request(app).post('/api/start-automation');
        expect(res.status).toBe(200);
    });

    it('POST /api/start-automation should handle async errors', async () => {
        (browser.launchAndNavigate as jest.Mock).mockRejectedValueOnce(new Error('Async fail'));
        const res = await request(app).post('/api/start-automation');
        expect(res.status).toBe(200);
        await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it('POST /api/cancel-automation should call cancelAutomation', async () => {
        const res = await request(app).post('/api/cancel-automation');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(browser.cancelAutomation).toHaveBeenCalled();
    });

    it('POST /api/cancel-automation should handle errors', async () => {
        (browser.cancelAutomation as jest.Mock).mockRejectedValueOnce(new Error('Fail'));
        const res = await request(app).post('/api/cancel-automation');
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        // Wait for microtasks to finish the rejection
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
});
