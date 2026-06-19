import { BaseElement } from './BaseElement';

export class InputElement extends BaseElement {
    public value: string;

    constructor(metadata: any = {}) {
        super(metadata);
        this.value = metadata.value || '';
    }

    getSelector(): string {
        return super.getSelector() || 'input, textarea';
    }
}
