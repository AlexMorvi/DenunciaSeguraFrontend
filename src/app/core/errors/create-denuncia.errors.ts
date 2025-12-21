export class FormValidationError extends Error {
    readonly invalidFields: string[];
    constructor(message: string, invalidFields: string[] = []) {
        super(message);
        this.name = 'FormValidationError';
        this.invalidFields = invalidFields;
        Object.setPrototypeOf(this, FormValidationError.prototype);
    }
}

export class FileTooLargeError extends Error {
    readonly maxSizeBytes: number;
    readonly actualSizeBytes?: number;
    constructor(message: string, maxSizeBytes: number, actualSizeBytes?: number) {
        super(message);
        this.name = 'FileTooLargeError';
        this.maxSizeBytes = maxSizeBytes;
        this.actualSizeBytes = actualSizeBytes;
        Object.setPrototypeOf(this, FileTooLargeError.prototype);
    }
}

export class UnsupportedFileTypeError extends Error {
    readonly allowedTypes: string[];
    readonly receivedType?: string;
    constructor(message: string, allowedTypes: string[] = [], receivedType?: string) {
        super(message);
        this.name = 'UnsupportedFileTypeError';
        this.allowedTypes = allowedTypes;
        this.receivedType = receivedType;
        Object.setPrototypeOf(this, UnsupportedFileTypeError.prototype);
    }
}

export class MapInitializationError extends Error {
    constructor(message: string, public readonly original?: unknown) {
        super(message);
        this.name = 'MapInitializationError';
        Object.setPrototypeOf(this, MapInitializationError.prototype);
    }
}

export class GeolocationError extends Error {
    constructor(message: string, public readonly code?: number, public readonly original?: unknown) {
        super(message);
        this.name = 'GeolocationError';
        Object.setPrototypeOf(this, GeolocationError.prototype);
    }
}

export class DenunciaSubmissionError extends Error {
    constructor(message: string, public readonly original?: unknown) {
        super(message);
        this.name = 'DenunciaSubmissionError';
        Object.setPrototypeOf(this, DenunciaSubmissionError.prototype);
    }
}

export class EvidenceUploadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EvidenceUploadError';
        Object.setPrototypeOf(this, EvidenceUploadError.prototype);
    }
}
