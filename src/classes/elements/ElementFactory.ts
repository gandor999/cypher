import { BaseElement } from './BaseElement';
import { ButtonElement } from './ButtonElement';
import { GenericElement } from './GenericElement';

export class ElementFactory {
    static create(type: string, metadata: any): BaseElement {
        switch (type) {
            case 'ButtonElement':
                return new ButtonElement(metadata);
            default:
                return new GenericElement(metadata);
        }
    }
}
