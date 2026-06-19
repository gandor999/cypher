import { ElementFactory, ButtonElement, GenericElement } from '../../../src/classes/elements';

describe('Elements Factory & Classes', () => {
    it('creates a GenericElement for unknown types', () => {
        const el = ElementFactory.create('UnknownType', { text: 'Test' });
        expect(el).toBeInstanceOf(GenericElement);
        expect(el.text).toBe('Test');
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

    it('ButtonElement selector generator by cssClass', () => {
        const el = new ButtonElement({ class: 'btn-submit' });
        expect(el.getSelector()).toBe('button.btn-submit');
    });

    it('BaseElement constructor with undefined metadata', () => {
        const el = new GenericElement(undefined);
        expect(el.getSelector()).toBe('a, button, span, div, input');
    });
});
