import { BaseElement } from './BaseElement';

export class FlutterElement extends BaseElement {
    getSelector(): string {
        // Automatically default to searching Flutter accessibility nodes
        return super.getSelector() || 'flt-semantics, flt-semantics-placeholder';
    }
}
