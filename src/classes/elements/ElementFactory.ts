import { BaseElement } from './BaseElement';
import { ButtonElement } from './ButtonElement';
import { GenericElement } from './GenericElement';
import { InputElement } from './InputElement';
import { WaitElement } from './WaitElement';
import { FlutterElement } from './FlutterElement';

export class ElementFactory {
    static create(type: string, metadata: any): BaseElement {
        switch (type) {
            case 'ButtonElement':
                return new ButtonElement(metadata);
            case 'InputElement':
                return new InputElement(metadata);
            case 'WaitElement':
                return new WaitElement(metadata);
            case 'FlutterElement':
                return new FlutterElement(metadata);
            default:
                return new GenericElement(metadata);
        }
    }
}
