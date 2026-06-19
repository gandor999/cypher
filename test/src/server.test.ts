import request from 'supertest';
import { app } from '../../src/server';
import { startServer } from '../../src/server';

jest.mock('../../src/browser', () => ({
    launchAndNavigate: jest.fn(),
    cancelAutomation: jest.fn()
}));

jest.mock(
    '../../src/browser/launcher',
    () => ({
        getActiveBrowser: jest.fn()
    }),
    { virtual: true }
);

jest.mock(
    '../../src/browser/util',
    () => ({
        getLivePageJsonAST: jest.fn()
    }),
    { virtual: true }
);

describe('Server', () => {
    it('should start the server', () => {
        const listenSpy = jest.spyOn(app, 'listen').mockImplementation((...args: any[]) => {
            const cb = args[args.length - 1];
            if (typeof cb === 'function') cb();
            return {} as any;
        });

        startServer(4000);
        expect(listenSpy).toHaveBeenCalledWith(4000, expect.any(Function));
        listenSpy.mockRestore();
    });

    it('should start the server with default port', () => {
        const listenSpy = jest.spyOn(app, 'listen').mockImplementation((...args: any[]) => {
            const cb = args[args.length - 1];
            if (typeof cb === 'function') cb();
            return {} as any;
        });

        startServer();
        expect(listenSpy).toHaveBeenCalledWith(3000, expect.any(Function));
        listenSpy.mockRestore();
    });
});
