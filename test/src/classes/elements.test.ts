import { ElementFactory, ButtonElement, GenericElement, InputElement } from '../../../src/classes/elements';

describe('Elements Factory & Classes', () => {
    it('creates a GenericElement for unknown types', () => {
        const el = ElementFactory.create('UnknownType', { text: 'Test' });
        expect(el).toBeInstanceOf(GenericElement);
        expect(el.text).toBe('Test');
    });

    it('creates an InputElement for InputElement type', () => {
        const el = ElementFactory.create('InputElement', { value: 'user@example.com' });
        expect(el).toBeInstanceOf(InputElement);
        expect((el as InputElement).value).toBe('user@example.com');
    });

    it('GenericElement selector fallback', () => {
        const el = new GenericElement({});
        expect(el.getSelector()).toBe('a, button, span, div, input');
    });

    it('BaseElement selector generator by cssClass', () => {
        // Needs to have only class to hit the cssClass branch
        const el = new GenericElement({ class: '  btn   btn-primary ' });
        // Generic element doesn't prefix button, it just uses the base selector
        expect(el.getSelector()).toBe('.btn.btn-primary');
    });

    it('BaseElement selector generator by id', () => {
        const el = new GenericElement({ id: 'my-id' });
        expect(el.getSelector()).toBe('#my-id');
    });

    it('ButtonElement selector generator by cssClass', () => {
        const el = new ButtonElement({ class: 'btn-submit' });
        expect(el.getSelector()).toBe('button.btn-submit');
    });

    it('InputElement selector generator fallback', () => {
        const el = new InputElement({});
        expect(el.getSelector()).toBe('input, textarea');
        expect(el.value).toBe('');
    });

    it('InputElement constructor with undefined metadata', () => {
        const el = new InputElement();
        expect(el.getSelector()).toBe('input, textarea');
        expect(el.value).toBe('');
    });

    it('BaseElement constructor with undefined metadata', () => {
        const el = new GenericElement(undefined);
        expect(el.getSelector()).toBe('a, button, span, div, input');
    });
});
