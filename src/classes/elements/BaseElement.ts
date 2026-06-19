export abstract class BaseElement {
    public text?: string;
    public id?: string;
    public cssClass?: string;
    public customSelector?: string;

    constructor(metadata: any = {}) {
        this.text = metadata.text;
        this.id = metadata.id;
        this.cssClass = metadata.class;
        this.customSelector = metadata.selector;
    }

    getSelector(): string {
        if (this.customSelector) {
            return this.customSelector;
        }
        let selector = '';
        if (this.id) {
            selector = `#${this.id}`;
        } else if (this.cssClass) {
            selector = this.cssClass
                .split(' ')
                .map((c) => c.trim())
                .filter(Boolean)
                .map((c) => `.${c}`)
                .join('');
        }
        return selector;
    }
}
