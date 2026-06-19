import request from 'supertest';
import { app } from '../../../src/server';
import * as browser from '../../../src/browser';
import { TARGET_URL } from '../../../src/constants';

jest.mock('../../../src/browser', () => ({
    launchAndNavigate: jest.fn().mockResolvedValue(true),
    cancelAutomation: jest.fn().mockResolvedValue(true)
}));

jest.mock(
    '../../../src/browser/launcher',
    () => ({
        getActiveBrowser: jest.fn().mockReturnValue(true)
    }),
    { virtual: true }
);

jest.mock(
    '../../../src/browser/util',
    () => ({
        getLivePageJsonAST: jest.fn().mockResolvedValue({ tag: 'body' })
    }),
    { virtual: true }
);

describe('GUI API Routes', () => {
    it('POST /api/start-automation should call launchAndNavigate', async () => {
        const res = await request(app).post('/api/start-automation');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(browser.launchAndNavigate).toHaveBeenCalledWith(TARGET_URL);
    });

    it('POST /api/start-automation should handle errors', async () => {
        (browser.launchAndNavigate as jest.Mock).mockImplementation(() => {
            throw new Error('Sync fail');
        });
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

    it('GET /api/inspect should extract AST and write to file', async () => {
        const fs = require('fs');
        const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
        const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
        const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);

        const launcherMock = require('../../../src/browser/launcher');
        const utilMock = require('../../../src/browser/util');

        launcherMock.getActiveBrowser.mockReturnValue(true);
        utilMock.getLivePageJsonAST.mockResolvedValue({ tag: 'body' });

        const res = await request(app).get('/api/inspect');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        expect(mkdirSpy).toHaveBeenCalled();

        existsSyncSpy.mockRestore();
        mkdirSpy.mockRestore();
        writeSpy.mockRestore();
    });

    it('GET /api/inspect should return 500 when activeBrowser is null', async () => {
        const launcherMock = require('../../../src/browser/launcher');
        const utilMock = require('../../../src/browser/util');

        launcherMock.getActiveBrowser.mockReturnValue(null);
        utilMock.getLivePageJsonAST.mockRejectedValue(new Error('No active browser running.'));

        const res = await request(app).get('/api/inspect');
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('No active browser running.');
    });

    it('GET /api/inspect should handle errors', async () => {
        const launcherMock = require('../../../src/browser/launcher');
        const utilMock = require('../../../src/browser/util');

        launcherMock.getActiveBrowser.mockReturnValue(true);
        utilMock.getLivePageJsonAST.mockRejectedValue(new Error('AST fail'));

        const res = await request(app).get('/api/inspect');
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('AST fail');
    });

    it('GET /api/inspect should not call mkdirSync if logsDir already exists', async () => {
        const fs = require('fs');
        const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
        const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
        const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

        const launcherMock = require('../../../src/browser/launcher');
        const utilMock = require('../../../src/browser/util');

        launcherMock.getActiveBrowser.mockReturnValue(true);
        utilMock.getLivePageJsonAST.mockResolvedValue({ tag: 'body' });

        const res = await request(app).get('/api/inspect');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        expect(mkdirSpy).not.toHaveBeenCalled();

        existsSyncSpy.mockRestore();
        mkdirSpy.mockRestore();
        writeSpy.mockRestore();
    });
});
