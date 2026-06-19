import crypto from 'crypto';

export class BaseException extends Error {
    public readonly id: string;
    public readonly name: string;
    public readonly isOperational: boolean;

    constructor(name: string, description: string, isOperational = true) {
        super(description);

        Object.setPrototypeOf(this, new.target.prototype);

        this.id = crypto.randomUUID();
        this.name = name;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}
