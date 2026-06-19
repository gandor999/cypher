import { BaseElement } from './BaseElement';

export class GenericElement extends BaseElement {
    getSelector(): string {
        return super.getSelector() || 'a, button, span, div, input';
    }
}
