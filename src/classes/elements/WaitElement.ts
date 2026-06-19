import { BaseElement } from './BaseElement';

export class WaitElement extends BaseElement {
    getSelector(): string {
        return (
            super.getSelector() ||
            'button, a, input[type="button"], input[type="submit"], div[role="button"], span[role="button"]'
        );
    }
}
