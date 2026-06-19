export interface IElementConfig {
    type: string;
    metadata: any;
}

export interface IClickStep {
    element: IElementConfig;
    index: number;
}
