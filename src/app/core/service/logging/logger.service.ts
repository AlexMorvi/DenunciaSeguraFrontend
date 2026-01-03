import { DestroyRef, Injectable, NgZone, PLATFORM_ID, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { LogEntry, LogLevel } from './logging.model';
import { environment } from '@/../environments/environment';
import { LOGGER_CONFIG, SENSITIVE_KEYS_REGEX } from './logger.config';

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    private readonly http = inject(HttpClient);
    private readonly destroyRef = inject(DestroyRef);
    private readonly ngZone = inject(NgZone);
    private readonly platformId = inject(PLATFORM_ID);

    private readonly apiUrl = `${environment.apiUrl}${LOGGER_CONFIG.ENDPOINT}`;
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    private logQueue: LogEntry[] = [];
    private flushTimer: any;

    private lastLogSignature = '';
    private lastLogTime = 0;

    constructor() {
        this.startFlushTimer();
        this.setupLifecycleHooks();
    }

    // Métodos públicos de loggeo
    logInfo(message: string, ...details: unknown[]) {
        this.processLog('INFO', message, details);
    }

    logWarn(message: string, ...details: unknown[]) {
        this.processLog('WARN', message, details);
    }

    logError(message: string, ...details: unknown[]) {
        this.processLog('ERROR', message, details);
    }

    // Core
    private processLog(level: LogLevel, message: string, details: unknown[]): void {
        if (this.shouldDebounce(message)) return;

        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            url: this.isBrowser ? window.location.href : 'SSR',
            extraInfo: this.sanitizeData(details)
        };

        if (isDevMode()) {
            const color = level === 'ERROR' ? 'color: red; font-weight: bold' : 'color: blue';
            console.log(`%c[${level}] ${message}`, color, details);
        }

        this.logQueue.push(entry);

        if (this.logQueue.length >= LOGGER_CONFIG.BATCH_SIZE) {
            this.flushLogs();
        }
    }

    private shouldDebounce(message: string): boolean {
        const now = Date.now();
        if (message === this.lastLogSignature && (now - this.lastLogTime < LOGGER_CONFIG.DEBOUNCE_TIME)) {
            return true;
        }
        this.lastLogSignature = message;
        this.lastLogTime = now;
        return false;
    }

    private flushLogs(): void {
        if (this.logQueue.length === 0) return;

        const logsToSend = [...this.logQueue];
        this.logQueue = [];

        this.http.post(this.apiUrl, logsToSend).subscribe({
            error: (err) => {
                if (isDevMode()) console.warn('LoggerService: Failed to send logs', err);
            }
        });
    }

    private flushOnExit(): void {
        if (!this.isBrowser || this.logQueue.length === 0) return;

        try {
            const blob = new Blob([JSON.stringify(this.logQueue)], { type: 'application/json' });
            const success = navigator.sendBeacon(this.apiUrl, blob);
            if (success) this.logQueue = [];
        } catch (e) {
            console.error('LoggerService: Beacon failed', e);
        }
    }

    private startFlushTimer(): void {
        if (!this.isBrowser) return;

        this.ngZone.runOutsideAngular(() => {
            this.flushTimer = setInterval(() => {
                this.ngZone.run(() => this.flushLogs());
            }, LOGGER_CONFIG.FLUSH_INTERVAL);
        });
    }

    private setupLifecycleHooks(): void {
        this.destroyRef.onDestroy(() => {
            if (this.flushTimer) clearInterval(this.flushTimer);
            this.flushLogs();
        });

        if (this.isBrowser) {
            this.ngZone.runOutsideAngular(() => {
                window.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'hidden') {
                        this.flushOnExit();
                    }
                });
            });
        }
    }

    private sanitizeData(data: unknown[]): unknown {
        if (!data || data.length === 0) return null;

        try {
            const jsonString = JSON.stringify(data, (key, value) => {
                if (key && typeof key === 'string' && SENSITIVE_KEYS_REGEX.test(key)) {
                    return '***REDACTED***';
                }
                return value;
            });
            return JSON.parse(jsonString);
        } catch (e) {
            return { info: 'Data logging failed: Circular reference or serialization error' };
        }
    }
}
