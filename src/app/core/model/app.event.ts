export interface OperationEvent<T> {
    userMessage: string;
    technicalMessage: string;
    severity: 'WARNING' | 'ERROR';
    logData: T;
}

export interface ImgLogData {
    // format: string;
    // url?: string;
}

export interface FileLogData {
    fileSize: number;
    mimeType: string;
}

export interface LocationLogData {
    received_lat?: string | number;
    received_lng?: string | number;
    denuncia_id?: string | number;
}

export interface SystemLogData {
    stack?: string;
    context?: string;
    denuncia_id?: string | number;
}

export type ImgEvent = OperationEvent<ImgLogData>;
export type FileEvent = OperationEvent<FileLogData>;
export type LocationEvent = OperationEvent<LocationLogData>;
export type SystemEvent = OperationEvent<SystemLogData>;

export type SecurityEvent = ImgEvent | FileEvent | LocationEvent | SystemEvent;
