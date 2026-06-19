import { BaseElement } from './BaseElement';
import { ButtonElement } from './ButtonElement';
import { GenericElement } from './GenericElement';
import { InputElement } from './InputElement';

export class ElementFactory {
    static create(type: string, metadata: any): BaseElement {
        switch (type) {
            case 'ButtonElement':
                return new ButtonElement(metadata);
            case 'InputElement':
                return new InputElement(metadata);
            default:
                return new GenericElement(metadata);
        }
    }
}
