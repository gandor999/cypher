import { BaseException, NavigationException } from '../../../../src/classes/exceptions';

describe('Exceptions', () => {
    it('BaseException generates a valid UUID and sets properties correctly', () => {
        const error = new BaseException('TestError', 'Test description', false);
        expect(error.id).toBeDefined();
        expect(error.name).toBe('TestError');
        expect(error.message).toBe('Test description');
        expect(error.isOperational).toBe(false);
    });

    it('BaseException defaults to true operational', () => {
        const error = new BaseException('TestError', 'Test description');
        expect(error.isOperational).toBe(true);
    });

    it('NavigationException defaults to true operational and custom message', () => {
        const originalError = new Error('Net Error');
        const error = new NavigationException('https://test.com', originalError);
        expect(error.name).toBe('NavigationException');
        expect(error.isOperational).toBe(true);
        expect(error.message).toContain('Failed to load the website at https://test.com. Reason: Net Error');
    });

    it('NavigationException handles string error properly', () => {
        const error = new NavigationException('https://test.com', 'String error');
        expect(error.message).toContain('Failed to load the website at https://test.com. Reason: String error');
    });
});
