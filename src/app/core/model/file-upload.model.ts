export interface FileUploadErrorEvent {
    userMessage: string;

    technicalMessage: string;
    logData: Record<string, any>;
    severity: 'WARNING' | 'ERROR';
}
