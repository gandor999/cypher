import { BaseElement } from './BaseElement';

export class ButtonElement extends BaseElement {
    getSelector(): string {
        let baseSelector = super.getSelector();
        if (baseSelector && baseSelector.startsWith('.')) {
            return `button${baseSelector}`;
        }
        return baseSelector || 'button, a, input[type="button"], input[type="submit"]';
    }
}
