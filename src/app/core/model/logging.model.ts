export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    url?: string;
    userId?: string;
    stack?: string;
    extraInfo?: any;
}
