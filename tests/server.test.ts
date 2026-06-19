import { startServer, app } from '../src/server';

jest.mock('../src/browser', () => ({
  launchAndNavigate: jest.fn(),
  cancelAutomation: jest.fn()
}));

describe('Server', () => {
  it('should start the server', () => {
    const listenSpy = jest.spyOn(app, 'listen').mockImplementation((port, cb: any) => {
      if (cb) cb();
      return {} as any;
    });
    
    startServer(4000);
    expect(listenSpy).toHaveBeenCalledWith(4000, expect.any(Function));
    listenSpy.mockRestore();
  });

  it('should start the server with default port', () => {
    const listenSpy = jest.spyOn(app, 'listen').mockImplementation((port, cb: any) => {
      if (cb) cb();
      return {} as any;
    });
    
    startServer();
    expect(listenSpy).toHaveBeenCalledWith(3000, expect.any(Function));
    listenSpy.mockRestore();
  });
});
